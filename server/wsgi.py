#-----------------------------------------------------------------------
# wsgi.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import os
from server import app
from dotenv import load_dotenv

#-----------------------------------------------------------------------

# Load .env
load_dotenv()
PORT = os.getenv('SERVER_PORT', 4000)

#-----------------------------------------------------------------------

if __name__ == "__main__":
    app.run(port=PORT, debug=True)
