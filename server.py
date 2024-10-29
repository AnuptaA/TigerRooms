#!/usr/bin/env python

#-----------------------------------------------------------------------
# server.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import flask
from flask_cors import CORS
import update_database
import sqlite3

#-----------------------------------------------------------------------

# app instance
app = flask.Flask(__name__)
CORS(app)

#-----------------------------------------------------------------------

# Homepage route
@app.route('/', methods=['GET'])
def index():
    return "Welcome to TigerRooms API"

#-----------------------------------------------------------------------

@app.route('/api/floorplans', methods=['GET'])
def get_unique_halls_and_floors():
    conn = sqlite3.connect('room_draw.db')
    cursor = conn.cursor()
    
    # Query for unique halls and floors
    cursor.execute('''
        SELECT hall, floor, room_number
        FROM RoomOverview
        GROUP BY hall, floor
        ORDER BY hall, floor
    ''')
    
    results = cursor.fetchall()
    conn.close()
    
    # Process the results to apply the "Wendell B" and "Wendell C" rule
    halls = {}
    for hall, floor, room_number in results:
        if hall == "Wendell":
            if room_number.startswith("B"):
                hall_display = "Wendell B Hall"
            elif room_number.startswith("C"):
                hall_display = "Wendell C Hall"
            else:
                hall_display = "Wendell Hall"
        else:
            hall_display = hall
        
        if hall_display not in halls:
            halls[hall_display] = []
        
        # Convert floor number to a readable format
        floor_label = f"{floor}rd Floor" if floor == 3 else f"{floor}th Floor"
        if floor == 1:
            floor_label = "1st Floor"
        elif floor == 2:
            floor_label = "2nd Floor"
        elif floor == 4:
            floor_label = "4th Floor"
        
        if floor_label not in halls[hall_display]:
            halls[hall_display].append(floor_label)
    
    # Convert to a list of dictionaries for JSON serialization
    hall_floor_data = [{"hall": hall, "floors": floors} for hall, floors in halls.items()]
    
    return flask.jsonify(hall_floor_data)

#-----------------------------------------------------------------------

@app.route('/api/floorplans/wendell-b-3rd-floor', methods=['GET'])
def get_wendell_b_3rd_floor():
    # Connect to the database
    conn = sqlite3.connect('room_draw.db')
    cursor = conn.cursor()
    
    # Query for Wendell Hall, floor 3, room numbers starting with 'B'
    cursor.execute('''
        SELECT RoomOverview.room_number, RoomOverview.isAvailable, RoomDetails.occupancy, RoomDetails.square_footage
        FROM RoomOverview
        JOIN RoomDetails ON RoomOverview.room_id = RoomDetails.room_id
        WHERE RoomOverview.hall = 'Wendell' AND RoomOverview.floor = 3 AND RoomOverview.room_number LIKE 'B%'
    ''')
    
    # Fetch results and close the connection
    rooms = cursor.fetchall()
    conn.close()
    
    # Format the results into JSON-serializable data
    room_info = [
        {
            "name": f"Wendell {room[0]}",
            "size": f"Size: {room[3]} sqft",
            "occupancy": f"Occupancy: {'Single' if room[2] == 1 else 'Double' if room[2] == 2 else 'Triple' if room[2] == 3 else 'Quad'}",
            "isAvailable": 'T' if room[1] else 'F'
        }
        for room in rooms
    ]
    
    return flask.jsonify(room_info)

#-----------------------------------------------------------------------
    
@app.route('/allfloorplans', methods=['GET'])
def allfloorplans():

    # replace example_function() with helper function to get object
    room_details = example_function()

    return flask.jsonify(room_details)

#-----------------------------------------------------------------------

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
    
@app.route('/uploadpdfs', methods=['POST'])
def uploadpdfs():
    print('hello')

#-----------------------------------------------------------------------

if __name__ == '__main__':
    app.run(debug=True)
