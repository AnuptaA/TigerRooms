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
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT RoomOverview.room_number, RoomOverview.isAvailable, RoomDetails.occupancy, RoomDetails.square_footage
        FROM RoomOverview
        JOIN RoomDetails ON RoomOverview.room_id = RoomDetails.room_id
        WHERE RoomOverview.hall = 'Wendell' AND RoomOverview.floor = 3 AND RoomOverview.room_number LIKE 'B%'
    ''')
    
    rooms = cursor.fetchall()
    conn.close()
    
    room_info = [
        {
            "name": f"Wendell {room[0]}",
            "size": f"Size: {room[3]} sqft",
            "occupancy": f"Occupancy: {'Single' if room[2] == 1 else 'Double' if room[2] == 2 else 'Triple' if room[2] == 3 else 'Quad'}",
            "isAvailable": 'T' if room[1] else 'F'
        }
        for room in rooms
    ]
    
    return jsonify(room_info)

#-----------------------------------------------------------------------

@app.route('/allfloorplans', methods=['GET'])
def allfloorplans():
    room_details = example_function()
    return jsonify(room_details)

@app.route('/floorplan', methods=['GET', 'POST'])
def floorplan():

    print('hello')

#-----------------------------------------------------------------------
    
@app.route('/searchresults', methods=['GET'])
def searchresults():

    print('hello')

#-----------------------------------------------------------------------
    
@app.route('/cart', methods=['GET', 'POST'])
def cart():

    print('hello')

#-----------------------------------------------------------------------

@app.route('/api/uploadpdf', methods=['POST'])
def upload_pdf():
    print('we are in the server')
    if 'rooms-pdf' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['rooms-pdf']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.endswith('.pdf'):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        print(file_path)
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
