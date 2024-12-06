#!/usr/bin/env python

#-----------------------------------------------------------------------
# server.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import flask
from flask import request, jsonify, session, redirect, send_from_directory, url_for
from flask_cors import CORS
import os
import subprocess
from db_config import DATABASE_URL
from dotenv import load_dotenv
from update_database import get_last_update_time, get_connection, return_connection
import CASauth as CASauth
from database_saves import get_room_id, save_room, unsave_room, get_total_saves, is_room_saved, get_saved_rooms_with_saves_and_availability, is_admin
from database_setup import main as setup_database
from database_reviews import save_review, get_review, delete_review, get_reviews, get_all_user_reviews, get_all_db_reviews
from update_database import send_email

#-----------------------------------------------------------------------

# app instance
app = flask.Flask(__name__, static_folder='build')
CORS(app, supports_credentials=True)

#-----------------------------------------------------------------------

# Load .env
load_dotenv()
app.secret_key = os.getenv('APP_SECRET_KEY')
PORT = os.getenv('SERVER_PORT')

# Directory for storing uploaded PDFs
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_INVITES = 4 # change to 10 later

#-----------------------------------------------------------------------

def get_db_connection():
    conn = get_connection()
    return conn

#-----------------------------------------------------------------------

def require_login():
    # Helper function that forces user to log-in
    if 'username' not in session:
        return redirect(url_for('index'))
    return None

#-----------------------------------------------------------------------

@app.route('/')
def index():
    # Check if authenticate returned username, if successful, redirect
    username = CASauth.authenticate()
    print(f"CAS username returned: {username}")

    if username:
        session['username'] = username

    return send_from_directory(app.static_folder, 'index.html')

#-----------------------------------------------------------------------

@app.route('/<path:path>')
def catch_all(path):
    username = CASauth.authenticate()
    print(f"CAS username returned: {username}")

    if username:
        session['username'] = username
        if not is_admin(username):
            # Add the user to the Users table if not already present
            conn = get_db_connection()
            try:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO "Users" ("netid") VALUES (%s)
                    ON CONFLICT ("netid") DO NOTHING
                ''', (username,))
                conn.commit()
            except Exception as e:
                print(f"Error adding user to the database: {e}")
            finally:
                cursor.close()
                return_connection(conn)

    # Exclude API and static routes
    if path.startswith("api") or path.startswith("static"):
        return None  # Flask will process these routes normally
    elif path.startswith("misc"):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

#-----------------------------------------------------------------------

# Route to serve static files (like CSS, JS, images, etc.)
@app.route('/static/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder + '/static', path)

#-----------------------------------------------------------------------

@app.route('/logoutcas', methods=['GET'])
def logoutcas():
    session.clear()
    try:
        print("reached server logout")
        # Construct CAS logout URL
        logout_url = (CASauth._CAS_URL + 'logout')
        # Redirect to CAS logout URL
        return jsonify({'status': "success", 'logout_url': logout_url})
    except Exception as e:
        return jsonify({'status': 'failure', 'message': str(e)}), 500

#-----------------------------------------------------------------------

# Endpoint for React to check if user is authenticated
@app.route('/api/user', methods=['GET'])
def get_user_data():
    if 'username' in session:
        print(f"username {session['username']}")
        print(f"admin status: {is_admin(session['username'])}")
        return jsonify({"status": "success",
                         'username': session['username'],
                         "admin_status": is_admin(session['username']) }), 200
    else:
        print("username not in session")
        return jsonify({"status": "failure", "message": "User not authenticated"}), 401

#-----------------------------------------------------------------------

@app.route('/api/floorplans', methods=['GET'])
def get_unique_halls_and_floors():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Set filter parameters, using '%' for wildcard if they are empty
    resco = flask.request.args.get('resco') or '%'
    hall = flask.request.args.get('hall') or '%'
    floor = flask.request.args.get('floor') or '%'
    occupancy = flask.request.args.get('occupancy') or '%'
    minSquareFootage = flask.request.args.get('minSquareFootage') or 0  # Default to 0 for numeric filter

    # Prepare parameters list with floor and square footage filters as needed
    params = [resco, hall, floor, occupancy, minSquareFootage]

    # Execute the query with filters applied
    cursor.execute('''
        SELECT
            "RoomOverview"."hall",
            "RoomOverview"."floor"
        FROM "RoomOverview"
        JOIN "RoomDetails" ON "RoomOverview"."room_id" = "RoomDetails"."room_id"
        WHERE "RoomOverview"."residential_college" LIKE %s
        AND "RoomOverview"."hall" LIKE %s
        AND "RoomOverview"."floor"::TEXT LIKE %s
        AND "RoomDetails"."occupancy"::TEXT LIKE %s
        AND "RoomDetails"."square_footage" >= %s
        GROUP BY "RoomOverview"."hall", "RoomOverview"."floor"
        ORDER BY "RoomOverview"."hall", "RoomOverview"."floor"
    ''', params)


    results = cursor.fetchall()
    cursor.close()
    return_connection(conn)

    # Organize results into hall and floor labels
    halls = {}
    for hall_display, floor in results:
        if hall_display not in halls:
            halls[hall_display] = []

        floor_label = f"{floor}rd Floor" if floor == 3 else f"{floor}th Floor"
        if floor == 1:
            floor_label = "1st Floor"
        elif floor == 2:
            floor_label = "2nd Floor"
        elif floor == 4:
            floor_label = "4th Floor"

        if floor_label not in halls[hall_display]:
            halls[hall_display].append(floor_label)

    # Convert halls dictionary to JSON-compatible structure
    hall_floor_data = [{"hall": hall, "floors": floors} for hall, floors in halls.items()]

    return jsonify(hall_floor_data)

#-----------------------------------------------------------------------

#-SFOIjdkfjgiodfkgjkldfgjkljklgjdklsjgkl jklJW WIPPPPPPP!!!! CHECK!! sfdkfsdklkfldsjkldsjfkljklsdfjkldsjfklsdjklfjklsfjklsdjfkljsdklfjklsdfklsdjfkljslkdfjklsdjfklsdjf
@app.route('/api/floorplans/hallfloor', methods=['GET'])
def get_hallfloor():
    # Ensure user is logged in before accessing API
    if require_login():
        return require_login()

    netid = request.args.get('netid')  # Get netid from query parameters

    # Must be logged in as the user to obtain data
    if netid != session['username']:
        return jsonify({"error": "Unauthorized: netid does not match session username"}), 403

    hall = request.args.get('hall')  # Get hall from query parameters
    floor = request.args.get('floor')  # Get hall from query parameters

    try:
        desired_occupancy = int(request.args.get('occupancy', -1))  # Get occupancy from query parameters
    except: # handles case where non-integer params are given
        desired_occupancy = -1

    try:
        desired_min_sqft = int(request.args.get('minSquareFootage', -1))  # Get hall from query parameters
    except: # handles case where non-integer params are given
        desired_min_sqft = -1

    print("desired occupancy=", desired_occupancy, end='')
    print("desired min_sqft=", desired_min_sqft)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Fetch rooms and details, including room_id
        cursor.execute('''
            SELECT "RoomOverview"."room_id", "RoomOverview"."room_number", "RoomOverview"."isAvailable",
                   "RoomDetails"."occupancy", "RoomDetails"."square_footage"
            FROM "RoomOverview"
            JOIN "RoomDetails" ON "RoomOverview"."room_id" = "RoomDetails"."room_id"
            WHERE "RoomOverview"."hall" = %s
            AND "RoomOverview"."floor" = %s
            AND (%s = -1 OR "RoomDetails"."occupancy" = %s)
            AND "RoomDetails"."square_footage" >= %s
            ORDER BY "RoomOverview"."room_number"
        ''', (hall, floor, desired_occupancy, desired_occupancy, desired_min_sqft))

        rooms = cursor.fetchall()

        # Construct the response with room info, total saves, and saved status for the user
        room_info = []
        for room in rooms:
            room_id, room_number, is_available, occupancy, square_footage = room
            total_saves = get_total_saves(room_number, hall, cursor)
            is_saved = is_room_saved(netid, room_number, hall, cursor) if netid else False

            room_info.append({
                "room_id": room_id,  # Now including room_id in the response
                "name": f"{hall} {room_number}",
                "size": f"Size: {square_footage} sqft",
                "occupancy": f"Occupancy: {'Single' if occupancy == 1 else 'Double' if occupancy == 2 else 'Triple' if occupancy == 3 else 'Quad'}",
                "isAvailable": 'T' if is_available else 'F',
                "total_saves": total_saves,
                "isSaved": is_saved
            })

        # Fetch the list of room_ids where the user has written a review
        cursor.execute('''
            SELECT "room_id"
            FROM "RoomReviews"
            WHERE "netid" = %s
        ''', (netid,))

        # A set of room_ids where reviews exist
        reviewed_room_ids = {row[0] for row in cursor.fetchall()}

        # Add a boolean field "has_reviewed" to each room indicating if the user has reviewed it
        for room in room_info:
            room['has_reviewed'] = room['room_id'] in reviewed_room_ids  # Check if the room_id is in the set of reviewed room_ids

        return jsonify(room_info), 200

    except Exception as e:
        # Log the error and return a server error response
        print(f"Error fetching data: {e}")
        return jsonify({"error": "Error fetching data"}), 500

    finally:
        # Close the connection and return it to the pool
        return_connection(conn)

#-----------------------------------------------------------------------

# Save a room

#-SFOIjdkfjgiodfkgjkldfgjkljklgjdklsjgkl jklJW WIPPPPPPP!!!! CHECK!! sfdkfsdklkfldsjkldsjfkljklsdfjkldsjfklsdjklfjklsfjklsdjfkljsdklfjklsdfklsdjfkljslkdfjklsdjfklsdjf
@app.route('/api/save_room', methods=['POST'])
def api_save_room():
    # Ensure user is logged in before accessing API
    if require_login():
        return require_login()

    data = request.json
    netid = data.get('netid')

    # Must be logged in as the user to obtain data
    if netid != session['username']:
        return jsonify({"error": "Unauthorized: netid does not match session username"}), 403
    
    room_id = data.get('room_id')

    if not all([netid, room_id]):
        return jsonify({"error": "Missing netid or room_id"}), 400

    save_room(netid, room_id)
    return jsonify({"message": f"Room {room_id} saved successfully for {netid}"}), 200

#-----------------------------------------------------------------------

# Unsave a room

#-SFOIjdkfjgiodfkgjkldfgjkljklgjdklsjgkl jklJW WIPPPPPPP!!!! CHECK!! sfdkfsdklkfldsjkldsjfkljklsdfjkldsjfklsdjklfjklsfjklsdjfkljsdklfjklsdfklsdjfkljslkdfjklsdjfklsdjf
@app.route('/api/unsave_room', methods=['POST'])
def api_unsave_room():
    # Ensure user is logged in before accessing API
    if require_login():
        return require_login()

    data = request.json
    netid = data.get('netid')

    # Must be logged in as the user to obtain data
    if netid != session['username']:
        return jsonify({"error": "Unauthorized: netid does not match session username"}), 403
    
    room_id = data.get('room_id')
    print(f"Tryna unsave this room id bruh: {room_id}")

    if not all([netid, room_id]):
        return jsonify({"error": "Missing netid or room_id"}), 400

    print("Still going")
    unsave_room(netid, room_id)
    print("shouldn't reach here idt")
    return jsonify({"message": f"Room {room_id} unsaved successfully for {netid}"}), 200

#-----------------------------------------------------------------------

#-SFOIjdkfjgiodfkgjkldfgjkljklgjdklsjgkl jklJW WIPPPPPPP!!!! CHECK!! sfdkfsdklkfldsjkldsjfkljklsdfjkldsjfklsdjklfjklsfjklsdjfkljsdklfjklsdfklsdjfkljslkdfjklsdjfklsdjf
@app.route('/api/saved_rooms', methods=['GET'])
def api_get_saved_rooms():
    # Ensure user is logged in before accessing the API
    if require_login():
        return require_login()

    requesting_netid = session['username']
    target_netid = request.args.get('user_id')

    if not target_netid:
        return jsonify({"error": "Missing user_id parameter"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # If the requesting user is trying to fetch their own saved rooms, allow it without group checks
        if requesting_netid == target_netid:
            saved_rooms = get_saved_rooms_with_saves_and_availability(target_netid)
            return jsonify({"netid": target_netid, "saved_rooms": saved_rooms}), 200

        # Check if both users are in the same group (for accessing others' saved rooms)
        cursor.execute('''
            SELECT "group_id"
            FROM "GroupMembers"
            WHERE "netid" = %s
        ''', (requesting_netid,))
        requesting_user_group = cursor.fetchone()

        if not requesting_user_group:
            return jsonify({"error": "You are not in a group"}), 403

        cursor.execute('''
            SELECT "group_id"
            FROM "GroupMembers"
            WHERE "netid" = %s
        ''', (target_netid,))
        target_user_group = cursor.fetchone()

        if not target_user_group or requesting_user_group[0] != target_user_group[0]:
            return jsonify({"error": "You do not have permission to view this user's saved rooms"}), 403

        # Fetch the saved rooms for the target user
        saved_rooms = get_saved_rooms_with_saves_and_availability(target_netid)
        return jsonify({"netid": target_netid, "saved_rooms": saved_rooms}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

@app.route('/api/uploadpdf', methods=['POST'])
def upload_pdf():
    # Debugging
    try:
        request_type = request.form.get('request-type')

        if not request_type:
            return jsonify({"error": "Request type is missing."}), 400

        try:
            # Convert to an integer, as it's sent as a string
            request_type = int(request_type)
        except ValueError:
            return jsonify({"error": "Invalid request type format."}), 400

        # Handle different request types
        if request_type == 1:
            # Retrieve the file from the request
            if 'rooms-pdf' not in request.files:
                return jsonify({"error": "No file part in the request."}), 400

            file = request.files['rooms-pdf']
            if file.filename == '':
                return jsonify({"error": "No selected file."}), 400

            # Ensure the file is a PDF
            if file and file.filename.endswith('.pdf'):
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)

                file.save(file_path)

                # Run the subprocess to update the database with the new file
                result = subprocess.run(
                    ['python', 'update_database.py', file_path],
                    capture_output=True, text=True
                )
                print(f"Result subprocess ouput: {result.stdout}")

                # Check subprocess output for a specific message indicating no update was needed
                if "NO_UPDATE" in result.stdout:
                    print("No update performed: New timestamp is not more recent.")
                    return jsonify({"message": "No update was made because the new timestamp is not more recent than the existing timestamp."}), 200

                # Handle other subprocess errors
                if result.returncode != 0:
                    print(f"Subprocess failed with stderr: {result.stderr}")
                    print(f"Subprocess stdout: {result.stdout}")
                    return jsonify({"error": "Database update failed.", "details": result.stderr}), 500

                print(f"Database updated successfully with file: {file.filename}")
                return jsonify({"message": "PDF uploaded and database updated successfully!"}), 200

            else:
                return jsonify({"error": "Invalid file type. Only PDFs are allowed."}), 400

        elif request_type == 0:
            # Reset the database directly by calling setup_database()
            try:
                print("Resetting the database...")
                setup_database()  # Call the setup function directly
                print("Database reset successfully.")
                return jsonify({"message": "Database reset successfully!"}), 200
            except Exception as e:
                print(f"Error resetting database: {str(e)}")
                return jsonify({"error": "Database reset failed.", "details": str(e)}), 500

        else:
            return jsonify({"error": "Invalid request type."}), 400

    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

#-----------------------------------------------------------------------

@app.route('/api/getupdatedtime', methods=['GET'])
def get_updated_time():
    last_update = get_last_update_time()
    print("updated time in server:", last_update)
    return jsonify({"timestamp": last_update})

#-----------------------------------------------------------------------

@app.route('/api/clear_drawn_rooms', methods=['POST'])
def clear_drawn_rooms():
    # Ensure user is logged in before accessing API
    if require_login():
        return require_login()

    print("Endpoint '/api/clear_drawn_rooms' was hit.")
    data = request.json
    print(f"Request data received: {data}")

    netid = data.get('netid')
    if not netid:
        print("Error: Missing netid in request.")
        return jsonify({"error": "Missing netid"}), 400

    # Must be logged in as the user to clear draw rooms
    if netid != session['username']:
        return jsonify({"error": "Unauthorized: netid does not match session username"}), 403

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        print(f"Executing DELETE query for netid: {netid}")

        # Execute the DELETE query
        cursor.execute('''
            DELETE FROM "RoomSaves"
            WHERE "netid" = %s
            AND "room_id" IN (
                SELECT "room_id" FROM "RoomOverview" WHERE "isAvailable" = FALSE
            )
        ''', (netid,))

        # Fetch the number of rows deleted
        rows_deleted = cursor.rowcount
        print(f"Rows deleted: {rows_deleted}")

        conn.commit()
        print("Transaction committed successfully.")
        return jsonify({"message": f"All drawn rooms cleared from cart. Rows affected: {rows_deleted}"}), 200
    except Exception as e:
        print(f"Error during clearing drawn rooms: {e}")
        return jsonify({"error": "Failed to clear drawn rooms.", "details": str(e)}), 500
    finally:
        print("Closing database connection.")
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

@app.route('/api/reviews/get_review_of_user', methods=['POST'])
def get_review_of_user():
    # Ensure user is logged in before accessing API
    if require_login():
        require_login

    print("Endpoint 'api/reviews/get_review_of_user'")
    data = request.json
    print(f"Request data received: {data}")
    netid = data.get('netid')

    if not netid:
        print("Error: Missing netid in request.")
        return jsonify({"error": "Missing netid"}), 400

    if netid != session['username']:
        return jsonify({"error": "Unauthorized: netid does not match session username"}), 403

    room_id = data.get('room_id')

    if not all([netid, room_id]):
        return jsonify({"error": "Missing netid, room_id"}), 400

    result = get_review(netid, room_id)

    if not result["success"]:
        return jsonify({"error": result["error"]}), 500

    return jsonify({
        "success": "Successfully fetched user review",
        "review": result["review"]}), 200

#-----------------------------------------------------------------------

@app.route('/api/reviews/delete_review_of_user', methods=['POST'])
def delete_review_of_user():
    # Ensure user is logged in before accessing API
    if require_login():
        require_login

    print("Endpoint 'api/reviews/delete_review_of_user'")
    data = request.json
    print(f"Request data received: {data}")
    netid = data.get('netid')

    if not netid:
        print("Error: Missing netid in request.")
        return jsonify({"error": "Missing netid"}), 400
    
    # if netid != session['username']:
    #     return jsonify({"error": "Unauthorized: netid does not match session username"}), 403
    
    room_id = data.get('room_id')

    if not all([netid, room_id]):
        return jsonify({"error": "Missing netid, room_id"}), 400

    message = delete_review(netid, room_id)

    if "Error" in message:
        return jsonify({"error": message}), 500

    return jsonify({"success": message}), 200

#-----------------------------------------------------------------------

@app.route('/api/reviews/submit_review', methods=['POST'])
def submit_review():
    # Ensure user is logged in before accessing API
    if require_login():
        return require_login()

    print("Endpoint '/api/reviews/submit_review'")
    data = request.json
    print(f"Request data received: {data}")
    netid = data.get('netid')

    if not netid:
        print("Error: Missing netid in request.")
        return jsonify({"error": "Missing netid"}), 400

    # Must be logged in as the user to submit review
    if netid != session['username']:
        return jsonify({"error": "Unauthorized: netid does not match session username"}), 403

    room_id = data.get('room_id')
    rating = data.get('rating')
    comments = data.get('comments')
    review_date = data.get('review_date')

    if not all([room_id, rating, comments, review_date]):
        return jsonify({"error": "Missing required fields"}), 400
    
    all_prev_reviews_result = get_all_user_reviews(netid)

    if not all_prev_reviews_result["success"]:
        return jsonify({"error": all_prev_reviews_result["message"]}), 500
    
    prev_reviews = all_prev_reviews_result["reviews"]
    if len(prev_reviews) >= 5:
        message = f"You have {len(prev_reviews)} reviews. Please delete one"
        message += " and then resubmit this review. Thank you." 
        return jsonify({"error": message}), 400

    message = save_review(room_id, netid, rating, comments, review_date)

    # Return success or error message
    if "Error" in message:
        return jsonify({"error": message}), 500

    return jsonify({"success": message}), 200

#-----------------------------------------------------------------------

@app.route('/api/reviews/get_all_reviews_for_room', methods=['POST'])
def get_all_reviews_for_room():
    # Ensure user is logged in before accessing API
    if require_login():
        return require_login()
    
    print("Endpoint '/api/reviews/get_all_reviews_for_room'")
    data = request.json
    print(f"Request data received: {data}")
    netid = data.get('netid')

    if not netid:
        print("Error: Missing netid in request.")
        return jsonify({"error": "Missing netid"}), 400

    # Must be logged in as the user to submit review
    if netid != session['username']:
        return jsonify({"error": "Unauthorized: netid does not match session username"}), 403

    room_id = data.get('room_id')

    if not all([netid, room_id]):
        return jsonify({"error": "Missing required fields"}), 400

    result = get_reviews(room_id)

    if not result["success"]:
        return jsonify({"error": result["error"]}), 500

    return jsonify({
        "success": "Successfully fetched user reviews",
        "review": result["reviews"]}), 200

#-----------------------------------------------------------------------

@app.route('/api/reviews/get_all_reviews', methods=['POST'])
def get_all_reviews():
    # Ensure user is logged in before accessing API
    if require_login():
        require_login()

    netid = request.args.get('netid')   # Get netid from query params

    if not netid:
        print("Error: Missing netid in request for getting all reviews.")
        return jsonify({"error": "Missing netid"}), 400

    # Must be logged in as the user to obtain data
    if netid != session['username']:
        return jsonify({"error": "Unauthorized: netid does not match session username"}), 403
    
    # Must be admin to access all reviews
    if not is_admin(netid):
        return jsonify({"error": "Unauthorized: Only admins may access this page."}), 403
    
    result = get_all_db_reviews()

    if not result["success"]:
        return jsonify({"error": "Missing netid"}), 400
    
    return jsonify({
        "success": "Successfully fetched user reviews",
        "all_reviews": result["all_reviews"]}), 200

#-----------------------------------------------------------------------

@app.route('/api/create_group', methods=['POST'])
def create_group():
    if require_login():
        return require_login()

    netid = session['username']
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Check if the user is already in a group
        cursor.execute('''
            SELECT "group_id" FROM "GroupMembers" WHERE "netid" = %s
        ''', (netid,))
        group = cursor.fetchone()

        if group:
            # Fetch remaining invites for the user
            cursor.execute('''
                SELECT "num_invites" FROM "Users" WHERE "netid" = %s
            ''', (netid,))
            remaining_invites = max(ALLOWED_INVITES - cursor.fetchone()[0], 0)

            return jsonify({
                "message": "User already in a group",
                "group_id": group[0],
                "remaining_invites": remaining_invites
            }), 200

        # Create a new group
        cursor.execute('''
            INSERT INTO "Groups" ("creator_netid") VALUES (%s) RETURNING "group_id"
        ''', (netid,))
        group_id = cursor.fetchone()[0]

        # Add the user as a member of the group
        cursor.execute('''
            INSERT INTO "GroupMembers" ("group_id", "netid") VALUES (%s, %s)
        ''', (group_id, netid))

        # Fetch remaining invites for the user
        cursor.execute('''
            SELECT "num_invites" FROM "Users" WHERE "netid" = %s
        ''', (netid,))
        remaining_invites = max(ALLOWED_INVITES - cursor.fetchone()[0], 0)

        conn.commit()
        return jsonify({
            "message": "Group created successfully",
            "group_id": group_id,
            "remaining_invites": remaining_invites
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

# Add a member to a group by sending an invitation
@app.route('/api/add_member', methods=['POST'])
def add_member():
    if require_login():
        return require_login()

    inviter = session['username']
    data = request.json
    invitee = data.get('invitee')  # The NetID of the person being invited

    if not invitee:
        return jsonify({"error": "Missing invitee NetID"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Check if the inviter is in a group
        cursor.execute('''
            SELECT "group_id" FROM "GroupMembers" WHERE "netid" = %s
        ''', (inviter,))
        group = cursor.fetchone()

        if not group:
            return jsonify({"error": "You are not in a group"}), 400

        group_id = group[0]

        # Calculate current group size (members + pending invitations)
        cursor.execute('''
            SELECT COUNT(*) 
            FROM "GroupMembers" 
            WHERE "group_id" = %s
        ''', (group_id,))
        current_members = cursor.fetchone()[0]

        cursor.execute('''
            SELECT COUNT(*) 
            FROM "GroupInvites" 
            WHERE "group_id" = %s
        ''', (group_id,))
        pending_invitations = cursor.fetchone()[0]

        total_size = current_members + pending_invitations

        if total_size >= 4:
            return jsonify({"error": "Maximum group size of 4 reached"}), 400

        # Check if the invitee is already in a group
        cursor.execute('''
            SELECT "group_id" FROM "GroupMembers" WHERE "netid" = %s
        ''', (invitee,))
        existing_group = cursor.fetchone()

        if existing_group:
            return jsonify({"error": f"{invitee} is already in another group."}), 400

        # Check if the invitee already has a pending invitation
        cursor.execute('''
            SELECT 1 FROM "GroupInvites" WHERE "group_id" = %s AND "invitee_netid" = %s
        ''', (group_id, invitee))
        existing_invite = cursor.fetchone()

        if existing_invite:
            return jsonify({"error": f"{invitee} already has a pending invitation to this group."}), 400

        # Step 6: Increment the inviter's num_invites in the Users table
        cursor.execute('''
            UPDATE "Users"
            SET "num_invites" = "num_invites" + 1
            WHERE "netid" = %s
        ''', (inviter,))

        # Send an invitation email
        email = f"{invitee}@princeton.edu"
        send_email(
            to_email=email,
            subject="[TigerRooms] - Group Invitation",
            body=(
                f"Dear {invitee},\n\n"
                f"You have been invited to join TigerRooms group {group_id}. "
                "To accept or decline this invitation, please log in to TigerRooms and navigate to the 'My Group' page at the following link:\n"
                "https://tigerrooms-l48h.onrender.com/mygroup\n\n"
                "Best regards,\n"
                "The TigerRooms Team"
            )
        )

        # Add the invitation to the GroupInvites table only if the email was successfully sent
        cursor.execute('''
            INSERT INTO "GroupInvites" ("group_id", "invitee_netid") VALUES (%s, %s)
        ''', (group_id, invitee))

        conn.commit()
        return jsonify({"message": f"Invitation sent to {invitee}@princeton.edu"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

# Accept an invitation to join a group
@app.route('/api/accept_invite', methods=['POST'])
def accept_invite():
    if require_login():
        return require_login()

    invitee = session['username']
    data = request.json
    group_id = data.get('group_id')  # Use group_id from the request

    if not group_id:
        return jsonify({"error": "Missing group_id parameter"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Check if the invite is valid
        cursor.execute('''
            SELECT 1 FROM "GroupInvites" 
            WHERE "group_id" = %s AND "invitee_netid" = %s
        ''', (group_id, invitee))
        invite_exists = cursor.fetchone()

        if not invite_exists:
            return jsonify({"error": "Invalid or expired invitation"}), 400

        # Check if the invitee is already in a group
        cursor.execute('''
            SELECT "group_id" FROM "GroupMembers" WHERE "netid" = %s
        ''', (invitee,))
        existing_group = cursor.fetchone()

        if existing_group:
            return jsonify({"error": "You are already in a group"}), 400

        # Add the invitee to the group
        cursor.execute('''
            INSERT INTO "GroupMembers" ("group_id", "netid") VALUES (%s, %s)
        ''', (group_id, invitee))

        # Remove all other pending invitations for the user
        cursor.execute('''
            DELETE FROM "GroupInvites"
            WHERE "invitee_netid" = %s
        ''', (invitee,))

        conn.commit()
        return jsonify({"message": "You have joined the group", "group_id": group_id}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

# Decline an invitation to join a group
@app.route('/api/decline_invite', methods=['POST'])
def decline_invite():
    if require_login():
        return require_login()

    invitee = session['username']
    data = request.json
    group_id = data.get('group_id')

    if not group_id:
        return jsonify({"error": "Missing group_id parameter"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Remove the specific invitation for the invitee and group
        cursor.execute('''
            DELETE FROM "GroupInvites"
            WHERE "invitee_netid" = %s AND "group_id" = %s
        ''', (invitee, group_id))

        conn.commit()
        return jsonify({"message": "Invitation declined"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

# Get the user's group details
@app.route('/api/my_group', methods=['GET'])
def my_group():
    if require_login():
        return require_login()

    netid = session['username']
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Check if the user has a pending invitation
        cursor.execute('''
            SELECT "Groups"."group_id"
            FROM "GroupInvites"
            JOIN "Groups" ON "GroupInvites"."group_id" = "Groups"."group_id"
            WHERE "invitee_netid" = %s
        ''', (netid,))
        invitation = cursor.fetchone()

        if invitation:
            group_id = invitation[0]
            # Get members of the invited group
            cursor.execute('''
                SELECT "netid" FROM "GroupMembers" WHERE "group_id" = %s
            ''', (group_id,))
            members = [row[0] for row in cursor.fetchall()]

            # Fetch remaining invites for the user
            cursor.execute('''
                SELECT "num_invites" FROM "Users" WHERE "netid" = %s
            ''', (netid,))
            remaining_invites = max(ALLOWED_INVITES - cursor.fetchone()[0], 0)

            return jsonify({
                "invitation": {
                    "group_id": group_id,
                    "members": members,
                    "remaining_invites": remaining_invites
                }
            }), 200

        # If no invitation, check for the user's group
        cursor.execute('''
            SELECT "group_id" FROM "GroupMembers" WHERE "netid" = %s
        ''', (netid,))
        group = cursor.fetchone()

        if not group:
            # Fetch remaining invites for the user
            cursor.execute('''
                SELECT "num_invites" FROM "Users" WHERE "netid" = %s
            ''', (netid,))
            remaining_invites = max(ALLOWED_INVITES - cursor.fetchone()[0], 0)

            return jsonify({"message": "You are not in a group", "remaining_invites": remaining_invites}), 200

        group_id = group[0]

        # Get all members of the group
        cursor.execute('''
            SELECT "netid" FROM "GroupMembers" WHERE "group_id" = %s
        ''', (group_id,))
        members = [row[0] for row in cursor.fetchall()]

        # Fetch remaining invites for the user
        cursor.execute('''
            SELECT "num_invites" FROM "Users" WHERE "netid" = %s
        ''', (netid,))
        remaining_invites = max(ALLOWED_INVITES - cursor.fetchone()[0], 0)

        return jsonify({
            "group_id": group_id,
            "members": members,
            "remaining_invites": remaining_invites
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

# Get pending invitations for the user
@app.route('/api/my_pending_invites', methods=['GET'])
def my_pending_invites():
    if require_login():
        return require_login()

    invitee_netid = session['username']
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Fetch pending invitations for the user
        cursor.execute('''
            SELECT "Groups"."group_id"
            FROM "GroupInvites"
            JOIN "Groups" ON "GroupInvites"."group_id" = "Groups"."group_id"
            WHERE "GroupInvites"."invitee_netid" = %s
        ''', (invitee_netid,))

        invites = []
        for group_id, in cursor.fetchall():
            # Get members of the group
            cursor.execute('''
                SELECT "netid" FROM "GroupMembers" WHERE "group_id" = %s
            ''', (group_id,))
            members = [row[0] for row in cursor.fetchall()]

            invites.append({
                "group_id": group_id,
                "members": members
            })

        return jsonify({"invites": invites}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

# Get pending members for a group
@app.route('/api/group_pending_members', methods=['GET'])
def group_pending_members():
    if require_login():
        return require_login()

    # Get the group_id from the request arguments
    group_id = request.args.get('group_id')
    if not group_id:
        return jsonify({"error": "Missing group_id parameter"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Query to fetch all pending invitees for the given group_id
        cursor.execute('''
            SELECT "invitee_netid"
            FROM "GroupInvites"
            WHERE "group_id" = %s
        ''', (group_id,))
        pending_members = [row[0] for row in cursor.fetchall()]

        return jsonify({"group_id": group_id, "pending_members": pending_members}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

# Leave the current group
@app.route('/api/leave_group', methods=['POST'])
def leave_group():
    if require_login():
        return require_login()

    netid = session['username']
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Get the user's current group
        cursor.execute('''
            SELECT "group_id" FROM "GroupMembers" WHERE "netid" = %s
        ''', (netid,))
        group = cursor.fetchone()

        if not group:
            return jsonify({"error": "You are not in a group"}), 400

        group_id = group[0]

        # Remove the user from the group
        cursor.execute('''
            DELETE FROM "GroupMembers" WHERE "netid" = %s
        ''', (netid,))

        # Check if the group is now empty
        cursor.execute('''
            SELECT COUNT(*) FROM "GroupMembers" WHERE "group_id" = %s
        ''', (group_id,))
        remaining_members = cursor.fetchone()[0]

        # If no members remain, delete the group
        if remaining_members == 0:
            cursor.execute('''
                DELETE FROM "Groups" WHERE "group_id" = %s
            ''', (group_id,))
            # Clean up any group invites for the deleted group
            cursor.execute('''
                DELETE FROM "GroupInvites" WHERE "group_id" = %s
            ''', (group_id,))

        conn.commit()
        return jsonify({"message": "You have successfully left the group"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

# Remove a pending invitation
@app.route('/api/remove_invite', methods=['POST'])
def remove_invite():
    if require_login():
        return require_login()

    inviter = session['username']
    data = request.json
    group_id = data.get('group_id')  # Group ID to which the invitee was invited
    invitee_netid = data.get('invitee_netid')  # The NetID of the invitee to remove

    if not group_id or not invitee_netid:
        return jsonify({"error": "Missing group_id or invitee_netid"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Check if the inviter is part of the group
        cursor.execute('''
            SELECT 1
            FROM "GroupMembers"
            WHERE "group_id" = %s AND "netid" = %s
        ''', (group_id, inviter))
        is_member = cursor.fetchone()

        if not is_member:
            return jsonify({"error": "You are not authorized to manage this group"}), 403

        # Remove the pending invitation
        cursor.execute('''
            DELETE FROM "GroupInvites"
            WHERE "group_id" = %s AND "invitee_netid" = %s
        ''', (group_id, invitee_netid))

        # Send an email notification to the invitee
        invitee_email = f"{invitee_netid}@princeton.edu"
        email_subject = "[TigerRooms] - Group Invitation Removed"
        email_body = (
            f"Dear {invitee_netid},\n\n"
            f"Your pending invitation to join TigerRooms group {group_id} has been removed.\n\n"
            "Best regards,\n"
            "The TigerRooms Team"
        )

        try:
            send_email(
                to_email=invitee_email,
                subject=email_subject,
                body=email_body
            )
        except Exception as e:
            return jsonify({"error": "Failed to send email notification", "details": str(e)}), 500

        conn.commit()

        return jsonify({"message": f"Invitation for {invitee_netid} has been removed, and an email notification has been sent."}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

if __name__ == '__main__':
    app.run(port=PORT, debug=True)
