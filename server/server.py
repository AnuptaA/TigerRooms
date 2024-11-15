#!/usr/bin/env python

#-----------------------------------------------------------------------
# server.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import flask
from flask import request, jsonify, session, redirect, send_from_directory
from flask_cors import CORS
import psycopg2
import os
import subprocess
from db_config import DATABASE_URL
from dotenv import load_dotenv
from update_database import get_last_update_time
import CASauth as CASauth
from database_saves import get_room_id, save_room, unsave_room, get_total_saves, is_room_saved, get_saved_rooms_with_saves
from database_setup import main as setup_database

#-----------------------------------------------------------------------

# app instance
app = flask.Flask(__name__)
CORS(app, supports_credentials=True)

#-----------------------------------------------------------------------

# Load .env
load_dotenv()
app.secret_key = os.getenv('APP_SECRET_KEY')
PORT = os.getenv('SERVER_PORT')

# Default to localhost in development
REACT_APP_URL = os.getenv("REACT_APP_URL", "http://localhost:3000")

# Directory for storing uploaded PDFs
UPLOAD_FOLDER = 'uploads'
RESET_FILE = 'sample_pdfs/Wendell_All_Available.pdf'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

#-----------------------------------------------------------------------

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

#-----------------------------------------------------------------------

@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET'])
def index():
    # If the user is already athenticated, redirect to React app
    if 'username' in session:
        print(session['username'])
        return redirect(REACT_APP_URL)

    username = CASauth.authenticate()
    print(f"CAS username returned :{username}")
    # Check if authenticate returned username, if successful, redirect
    if isinstance(username, str):
        session['username'] = username
        return redirect(REACT_APP_URL)

    # Authentication failed
    return jsonify({'status': 'failure', 'message': 'Authentication failed'}), 401

#-----------------------------------------------------------------------

@app.route('/logoutcas', methods=['GET'])
def logoutcas():
    session.clear()
    try:
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
        return jsonify({'status': 'success', 'username': session['username']}), 200
    else:
        print("username not in session!")
        return jsonify({'status': 'failure', 'message': 'User not authenticated'}), 401

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
    print(params)

    # Execute the query with filters applied
    cursor.execute('''
        SELECT
            CASE
                WHEN "hall" = 'Wendell' AND LEFT("room_number", 1) = 'B' THEN 'Wendell-B'
                WHEN "hall" = 'Wendell' AND LEFT("room_number", 1) = 'C' THEN 'Wendell-C'
                WHEN "hall" = 'Baker' AND LEFT("room_number", 1) = 'E' THEN 'Baker-E'
                WHEN "hall" = 'Baker' AND LEFT("room_number", 1) = 'S' THEN 'Baker-S'
                ELSE "hall"
            END AS "hall_display",
            "floor"
        FROM "RoomOverview"
        JOIN "RoomDetails" ON "RoomOverview"."room_id" = "RoomDetails"."room_id"
        WHERE "RoomOverview"."residential_college" LIKE %s 
        AND "RoomOverview"."hall" LIKE %s 
        AND "RoomOverview"."floor"::TEXT LIKE %s
        AND "RoomDetails"."occupancy"::TEXT LIKE %s
        AND "RoomDetails"."square_footage" >= %s
        GROUP BY "hall_display", "floor"
        ORDER BY "hall_display", "floor"
    ''', params)

    results = cursor.fetchall()
    print('RESULTS: ' + str(results))
    conn.close()

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

@app.route('/api/floorplans/wendell-b-3rd-floor', methods=['GET'])
def get_wendell_b_3rd_floor():
    netid = request.args.get('netid')  # Get netid from query parameters
    conn = get_db_connection()
    cursor = conn.cursor()

    # Fetch rooms and details including room_number and hall
    cursor.execute('''
        SELECT "RoomOverview"."room_number", "RoomOverview"."isAvailable", 
               "RoomDetails"."occupancy", "RoomDetails"."square_footage"
        FROM "RoomOverview"
        JOIN "RoomDetails" ON "RoomOverview"."room_id" = "RoomDetails"."room_id"
        WHERE "RoomOverview"."hall" = 'Wendell' 
          AND "RoomOverview"."floor" = 3 
          AND "RoomOverview"."room_number" LIKE 'B%'
    ''')

    rooms = cursor.fetchall()
    conn.close()

    # Construct the response with room info, total saves, and saved status for the user
    room_info = []
    for room in rooms:
        room_number, is_available, occupancy, square_footage = room
        total_saves = get_total_saves(room_number, 'Wendell')
        is_saved = is_room_saved(netid, room_number, 'Wendell') if netid else False

        room_info.append({
            "name": f"Wendell {room_number}",
            "size": f"Size: {square_footage} sqft",
            "occupancy": f"Occupancy: {'Single' if occupancy == 1 else 'Double' if occupancy == 2 else 'Triple' if occupancy == 3 else 'Quad'}",
            "isAvailable": 'T' if is_available else 'F',
            "total_saves": total_saves,
            "isSaved": is_saved
        })

    return jsonify(room_info)

#-----------------------------------------------------------------------

# Save a room
@app.route('/api/save_room', methods=['POST'])
def api_save_room():
    data = request.json
    netid = data.get('netid')
    room_number = data.get('room_number')
    hall = data.get('hall')

    if not all([netid, room_number, hall]):
        return jsonify({"error": "Missing netid, room_number, or hall"}), 400

    save_room(netid, room_number, hall)
    return jsonify({"message": f"Room {room_number} in {hall} saved successfully for {netid}"}), 200

#-----------------------------------------------------------------------

# Unsave a room
@app.route('/api/unsave_room', methods=['POST'])
def api_unsave_room():
    data = request.json
    netid = data.get('netid')
    room_number = data.get('room_number')
    hall = data.get('hall')

    if not all([netid, room_number, hall]):
        return jsonify({"error": "Missing netid, room_number, or hall"}), 400

    unsave_room(netid, room_number, hall)
    return jsonify({"message": f"Room {room_number} in {hall} unsaved successfully for {netid}"}), 200

#-----------------------------------------------------------------------

# Get total saves for a specific room
@app.route('/api/total_saves', methods=['GET'])
def api_get_total_saves():
    room_number = request.args.get('room_number')
    hall = request.args.get('hall')

    if not all([room_number, hall]):
        return jsonify({"error": "Missing room_number or hall"}), 400

    total_saves = get_total_saves(room_number, hall)
    return jsonify({"room_number": room_number, "hall": hall, "total_saves": total_saves}), 200

#-----------------------------------------------------------------------

# Get all saved rooms for a specific user
@app.route('/api/saved_rooms', methods=['GET'])
def api_get_saved_rooms():
    user_id = request.args.get('user_id')
    saved_rooms = get_saved_rooms_with_saves(user_id)
    return jsonify({"netid": user_id, "saved_rooms": saved_rooms}), 200

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

                # Debugging print to check the file path and ensure the folder exists
                print(f"Saving file to: {file_path}")
                file.save(file_path)

                # Run the subprocess to update the database with the new file
                result = subprocess.run(
                    ['python', 'update_database.py', file_path],
                    capture_output=True, text=True
                )

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
            # Reset the database
            # result = subprocess.run(
            #     ['python', './database_setup.py'],
            #     capture_output=True, text=True
            # )
            print('bruh')
            # result = subprocess.run(
            #     ['python', './database_setup.py']
            # )
            # result = subprocess.run(
            #     ['python', './database_setup.py'],
            #     stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60,
            #     env=os.environ  # Pass current environment
            # )
            
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
        # Print the error message to the console for debugging
        print(f"An unexpected error occurred: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

#-----------------------------------------------------------------------

@app.route('/api/getupdatedtime', methods=['GET'])
def get_updated_time():
    last_update = get_last_update_time()
    print("updated time in server:", last_update)
    return jsonify({"timestamp": last_update})

#-----------------------------------------------------------------------

if __name__ == '__main__':
    app.run(port=PORT, debug=True)
