#!/usr/bin/env python

#-----------------------------------------------------------------------
# server.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import flask
from flask_cors import CORS
import psycopg2
from db_config import DATABASE_URL

#-----------------------------------------------------------------------

# app instance
app = flask.Flask(__name__)
CORS(app)

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
    
    # Query to distinguish between Wendell B and Wendell C without including room_number in GROUP BY
    cursor.execute('''
        SELECT 
            CASE 
                WHEN hall = 'Wendell' AND LEFT(room_number, 1) = 'B' THEN 'Wendell B Hall'
                WHEN hall = 'Wendell' AND LEFT(room_number, 1) = 'C' THEN 'Wendell C Hall'
                ELSE hall 
            END AS hall_display,
            floor
        FROM RoomOverview
        GROUP BY hall_display, floor
        ORDER BY hall_display, floor
    ''')
    
    results = cursor.fetchall()
    conn.close()
    
    # Process results into desired format
    halls = {}
    for hall_display, floor in results:
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
    conn = get_db_connection()
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
