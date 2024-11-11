# TigerRooms

# Shopping cart SVG from https://www.svgrepo.com/svg/80543/shopping-cart-outline

# couldn't find creator to credit

# PDF Parsing instructions

1. Install tabula by executing
   pip install tabula-py

2. Install jpype by executing
   pip install jpype1

3. Add available rooms to directory

4. Give PDF as command line argument to pdfparser.py
   python pdfparser.py somepath

5. View output

# Database

pip install psycopg2-binary
brew install postgresql
export PATH="/usr/local/opt/postgresql/bin:$PATH"
pip install psycopg2

# PDF Upload page

npm i sweetalert2
npm i sweetalert2-react-content

Run the following to install certificates for CAS
/Applications/Python\ 3.12/Install\ Certificates.command

export APP_SECRET_KEY=example

# Updated server build instructions

1. Make sure the env variables are loaded, run `source .env` if they
are not, or if the start command gives errors.

2. Execute `gunicorn --bind 127.0.0.1:$SERVER_PORT server:app` in the
terminal to run the server.
