import flask
from flask import request, redirect, session, jsonify, url_for
import dotenv
import CASauth
import os
from flask_cors import CORS

PORT = 2000
BASE_URL = f"http://localhost:{PORT}"

app = flask.Flask(__name__)
CORS(app, supports_credentials=True)
dotenv.load_dotenv()
app.secret_key = os.environ['APP_SECRET_KEY']

@app.route('/')
def index():
    # If user is already authenticated, redirect to React app
    if 'username' in session:
        return redirect("http://localhost:3000")  # Always redirect to React app if authenticated
    
    # Authenticate with CAS
    username = CASauth.authenticate()
    if isinstance(username, str):  # Check if authenticate returned a username
        session['username'] = username
        print(f'this is my username!!!!: {username}')
        return redirect("http://localhost:3000")  # Redirect to React app after successful login

    # Authentication failed
    return jsonify({'status': 'failure', 'message': 'Authentication failed'}), 401

# Endpoint for React to check if user is authenticated
@app.route('/api/user', methods=['GET'])
def get_user_data():
    if 'username' in session:
        return jsonify({'status': 'success', 'username': session['username']})  # Send JSON data to React
    else:
        return jsonify({'status': 'failure', 'message': 'User not authenticated'}), 401

if __name__ == "__main__":
    app.run(port=PORT, debug=True)