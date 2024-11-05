#!/usr/bin/env python

#-----------------------------------------------------------------------
# server.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import flask
from flask import request, jsonify
from flask_cors import CORS
import psycopg2
import os
import subprocess
from db_config import DATABASE_URL
from database_saves import get_room_id, save_room, unsave_room, get_total_saves, is_room_saved, get_saved_rooms_with_saves

#-----------------------------------------------------------------------

# app instance
app = flask.Flask(__name__)
CORS(app)

# Directory for storing uploaded PDFs
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

#-----------------------------------------------------------------------

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

#-----------------------------------------------------------------------

# Homepage route
@app.route('/', methods=['GET'])
def index():
    return "Welcome to TigerRooms API"

#-----------------------------------------------------------------------

@app.route('/api/floorplans', methods=['GET'])
def get_unique_halls_and_floors():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            CASE 
                WHEN hall = 'Wendell' AND LEFT(room_number, 1) = 'B' THEN 'Wendell B Hall'
                WHEN hall = 'Wendell' AND LEFT(room_number, 1) = 'C' THEN 'Wendell C Hall'
                WHEN hall = 'Baker' AND LEFT(room_number, 1) = 'E' THEN 'Baker E Hall'
                WHEN hall = 'Baker' AND LEFT(room_number, 1) = 'S' THEN 'Baker S Hall'
                ELSE hall 
            END AS hall_display,
            floor
        FROM RoomOverview
        GROUP BY hall_display, floor
        ORDER BY hall_display, floor
    ''')
    
    results = cursor.fetchall()
    conn.close()
    
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
        SELECT RoomOverview.room_number, RoomOverview.isAvailable, RoomDetails.occupancy, RoomDetails.square_footage
        FROM RoomOverview
        JOIN RoomDetails ON RoomOverview.room_id = RoomDetails.room_id
        WHERE RoomOverview.hall = 'Wendell' AND RoomOverview.floor = 3 AND RoomOverview.room_number LIKE 'B%'
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
@app.route('/api/saved_rooms/<netid>', methods=['GET'])
def api_get_saved_rooms(netid):
    saved_rooms = get_saved_rooms_with_saves(netid)
    return jsonify({"netid": netid, "saved_rooms": saved_rooms}), 200

#-----------------------------------------------------------------------

@app.route('/api/uploadpdf', methods=['POST'])
def upload_pdf():
    if 'rooms-pdf' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['rooms-pdf']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.endswith('.pdf'):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        
        result = subprocess.run(['python', 'update_database.py', file_path], capture_output=True, text=True)
        
        if result.returncode != 0:
            return jsonify({"error": "Database update failed", "details": result.stderr}), 500
        
        return jsonify({"message": "PDF uploaded and database updated successfully"}), 200
    else:
        return jsonify({"error": "Invalid file type. Only PDF is allowed."}), 400

#-----------------------------------------------------------------------

if __name__ == '__main__':
    app.run(debug=True)
