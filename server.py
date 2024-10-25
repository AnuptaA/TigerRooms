#!/usr/bin/env python

#-----------------------------------------------------------------------
# server.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import flask
from flask_cors import CORS
import update_database

#-----------------------------------------------------------------------

# app instance
app = flask.Flask(__name__)
CORS()

#-----------------------------------------------------------------------

# Homepage route
@app.route('/', methods=['GET'])
def index():
    print('hello')

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
