#!/usr/bin/env python

#-----------------------------------------------------------------------
# penny.py
# Author: Bob Dondero
#-----------------------------------------------------------------------

import os
import urllib.parse
import flask
import dotenv
import authlib.integrations.flask_client

from top import app

#-----------------------------------------------------------------------

dotenv.load_dotenv()
AUTH0_CLIENT_ID = os.environ.get('AUTH0_CLIENT_ID')
AUTH0_CLIENT_SECRET = os.environ.get('AUTH0_CLIENT_SECRET')
AUTH0_DOMAIN = os.environ.get("AUTH0_DOMAIN")

oauth = authlib.integrations.flask_client.OAuth(app)

oauth.register(
    'auth0',
    client_id=AUTH0_CLIENT_ID,
    client_secret=AUTH0_CLIENT_SECRET,
    client_kwargs={'scope': 'openid profile email'},
    server_metadata_url='https://' + AUTH0_DOMAIN +
        '/.well-known/openid-configuration')

#-----------------------------------------------------------------------
# Functions related to authentication
#-----------------------------------------------------------------------

# Authenticate the remote user, and return the user's username.
# Do not return unless the user is successfully authenticated.

def authenticate():

    # If the user is in the session, then the user was
    # authenticated previously.  So return the username.
    if 'user' in flask.session:
        return flask.session.get('user')['userinfo']['name']

    flask.abort(flask.redirect('/login'))

#-----------------------------------------------------------------------

@app.route('/callback', methods=["GET", "POST"])
def callback():
    try:
        token = oauth.auth0.authorize_access_token()
        flask.session['user'] = token
    except Exception:
        pass
    return flask.redirect('/')

#-----------------------------------------------------------------------

@app.route('/login', methods=['GET'])
def login():
    return oauth.auth0.authorize_redirect(
        redirect_uri=flask.url_for('callback', _external=True))

#-----------------------------------------------------------------------

@app.route('/logout', methods=['GET'])
def logout():
    flask.session.clear()
    return flask.redirect(
        'https://' + AUTH0_DOMAIN + '/v2/logout?'
        + urllib.parse.urlencode(
            {
                'returnTo': flask.url_for('loggedout', _external=True),
                'client_id': AUTH0_CLIENT_ID,
            },
            quote_via=urllib.parse.quote_plus))

#-----------------------------------------------------------------------

@app.route('/loggedout', methods=['GET'])
def loggedout():
    html_code = flask.render_template('loggedout.html')
    response = flask.make_response(html_code)
    return response
