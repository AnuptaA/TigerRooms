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

# CAS authentication

1. run mock_auth_server.py by typing python mock_auth_server.py. This will run on port 2000
2. uncomment the code in App.js under const app and save the changes
3. run the floorplan database with python server.py
4. run npm start

- If it's not working, try running in an incognito window. However, if you try to run it in an incognito window over and over, CAS will still remember your session. To reset your session so that CAS makes you authenticate again, go to Authentication Templates/PennyCasTigerRooms and run "python runserver.py". Then open the penny application with localhost:{PORT} and click logout of CAS session

Run the following to install certificates for CAS
/Applications/Python\ 3.12/Install\ Certificates.command

export APP_SECRET_KEY=kevin
