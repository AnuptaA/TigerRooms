#-----------------------------------------------------------------------
# database_setup.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
from db_config import DATABASE_URL

def main():
    try:
        # Connect to PostgreSQL database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        print("Connected to the database.")

        # Set lock timeout to prevent long waits for locks
        cursor.execute("SET lock_timeout = '5s';")  # Timeout after 5 seconds if a lock is not acquired
        conn.commit()  # Ensure this setting is applied

        # Enable autocommit mode for dropping tables
        conn.autocommit = True
        print("Dropping existing tables if they exist...")

        # List of tables to drop
        tables = ["LastTimestamp", "RoomSaves", "RoomDetails", "RoomOverview"]

        # Drop each table with autocommit enabled, to prevent lock issues from idle transactions
        for table in tables:
            try:
                cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
                print(f"{table} table dropped successfully.")
            except Exception as e:
                print(f"Error dropping {table} table: {e}")

        # Disable autocommit mode for subsequent transactional control
        conn.autocommit = False

        #-----------------------------------------------------------------------

        # Re-create tables in a single transaction to ensure atomicity
        try:
            print("Creating tables...")

            cursor.execute('''
                CREATE TABLE "RoomOverview" (
                    "room_id" SERIAL PRIMARY KEY,
                    "room_number" TEXT,
                    "hall" TEXT,
                    "floor" INTEGER,
                    "isAvailable" BOOLEAN
                )
            ''')
            print("RoomOverview table created.")

            cursor.execute('''
                CREATE TABLE "RoomDetails" (
                    "room_id" INTEGER PRIMARY KEY REFERENCES "RoomOverview"("room_id"),
                    "occupancy" INTEGER,
                    "square_footage" INTEGER,
                    "num_saves" INTEGER DEFAULT 0
                )
            ''')
            print("RoomDetails table created.")

            cursor.execute('''
                CREATE TABLE "RoomSaves" (
                    "netid" TEXT,
                    "room_id" INTEGER REFERENCES "RoomOverview"("room_id"),
                    PRIMARY KEY ("netid", "room_id")
                )
            ''')
            print("RoomSaves table created.")

            cursor.execute('''
                CREATE TABLE "LastTimestamp" (
                    "last_timestamp" TEXT PRIMARY KEY
                )
            ''')
            print("LastTimestamp table created.")

            conn.commit()  # Commit all create table operations at once
        except Exception as e:
            print(f"Error creating tables: {e}")
            conn.rollback()  # Rollback all table creations in case of error

        #-----------------------------------------------------------------------

        # Inserting initial 'N/A' timestamp, wrapped in a transaction
        print("Inserting initial 'N/A' timestamp...")
        try:
            cursor.execute('''
                INSERT INTO "LastTimestamp" ("last_timestamp") 
                VALUES ('N/A')
                ON CONFLICT ("last_timestamp") DO NOTHING
            ''')
            conn.commit()
            print("Initial 'N/A' timestamp inserted.")
        except Exception as e:
            print(f"Error inserting initial timestamp: {e}")
            conn.rollback()

        #-----------------------------------------------------------------------

        # Room data for different floors and halls
        room_data = [
            {
                "hall": "Wendell", "floor": 2, "room_numbers": ['B220', 'B218', 'B216', 'B214', 'B212', 'B210', 'B204', 'B215', 'B211', 'B209', 'B205'],
                "occupancies": [4, 4, 1, 4, 1, 1, 1, 4, 2, 4, 1], "square_footages": [458, 514, 149, 480, 152, 147, 139, 484, 212, 480, 113]
            },
            {
                "hall": "Wendell", "floor": 3, "room_numbers": ['B320', 'B318', 'B316', 'B314', 'B312', 'B310', 'B308', 'B317', 'B315', 'B313', 'B311', 'B309'],
                "occupancies": [4, 4, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4], "square_footages": [460, 517, 148, 484, 152, 148, 175, 115, 484, 115, 115, 512]
            },
            {
                "hall": "Wendell", "floor": 4, "room_numbers": ['B428', 'B426', 'B424', 'B422', 'B420', 'B418', 'B416', 'B414', 'B412', 'B410', 'B408', 'B421', 'B419', 'B417', 'B415', 'B411', 'B409', 'B407'],
                "occupancies": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1], "square_footages": [130, 150, 150, 131, 134, 140, 134, 137, 131, 133, 167, 195, 152, 153, 201, 208, 152, 206]
            },
            {
                "hall": "Wendell", "floor": 2, "room_numbers": ['C207', 'C209', 'C211', 'C213', 'C215', 'C217', 'C202', 'C204', 'C206', 'C208', 'C210', 'C212', 'C214', 'C216'],
                "occupancies": [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1], "square_footages": [146, 146, 147, 146, 147, 143, 160, 450, 143, 149, 150, 149, 149, 138]
            },
            {
                "hall": "Wendell", "floor": 3, "room_numbers": ['C307', 'C313', 'C317', 'C302', 'C304', 'C306', 'C308', 'C310', 'C312', 'C314', 'C316', 'C322'],
                "occupancies": [1, 4, 2, 1, 4, 1, 1, 1, 1, 1, 1, 1], "square_footages": [146, 623, 255, 145, 450, 146, 148, 149, 148, 148, 136, 210]
            },
            {
                "hall": "Wendell", "floor": 4, "room_numbers": ['C409', 'C411', 'C413', 'C415', 'C419', 'C402', 'C404', 'C406', 'C410', 'C412', 'C414', 'C416', 'C418', 'C422'],
                "occupancies": [1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], "square_footages": [129, 144, 149, 132, 213, 376, 134, 127, 148, 149, 148, 148, 136, 172]
            }
        ]

        # Populate tables with room data
        for data in room_data:
            hall = data["hall"]
            floor = data["floor"]
            room_numbers = data["room_numbers"]
            occupancies = data["occupancies"]
            square_footages = data["square_footages"]

            for i in range(len(room_numbers)):
                # Insert room into RoomOverview and RoomDetails
                cursor.execute(
                    '''
                    INSERT INTO "RoomOverview" ("room_number", "hall", "floor", "isAvailable")
                    VALUES (%s, %s, %s, %s)
                    RETURNING "room_id"
                    ''',
                    (room_numbers[i], hall, floor, True)
                )
                room_id = cursor.fetchone()[0]
                cursor.execute(
                    '''
                    INSERT INTO "RoomDetails" ("room_id", "occupancy", "square_footage", "num_saves")
                    VALUES (%s, %s, %s, %s)
                    ''',
                    (room_id, occupancies[i], square_footages[i], 0)
                )
            conn.commit()
            print(f"RoomOverview and RoomDetails tables populated for {hall} Hall, Floor {floor}.")

        #-----------------------------------------------------------------------

        print("Database setup and initial data population complete.")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        # Close the cursor and connection to release locks and end transactions
        cursor.close()
        conn.close()
        print("Database connection closed.")

# Run the script
if __name__ == "__main__":
    main()
