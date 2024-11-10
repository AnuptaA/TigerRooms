#-----------------------------------------------------------------------
# db_config.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import os
from dotenv import load_dotenv

#-----------------------------------------------------------------------

# Load environment variables 
load_dotenv()

HOST = os.getenv("DB_HOST")
PORT = os.getenv("DB_PORT")
DATABASE = os.getenv("DB_NAME")
USER = os.getenv("DB_USER")
PASSWORD = os.getenv("DB_PASSWORD")

# PostgreSQL connection string
DATABASE_URL = f"postgresql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}"

#-----------------------------------------------------------------------

def main():
    print("hello this is our super secret place :)")
    # print(DATABASE_URL)

#-----------------------------------------------------------------------

if __name__ == '__main__':
    main()