#-----------------------------------------------------------------------
# database_setup.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
import pandas as pd
from db_config import DATABASE_URL

def main():
    try:
        # Connect to PostgreSQL database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        print("Connected to the database.")

        # Set lock timeout to prevent long waits for locks
        cursor.execute("SET lock_timeout = '5s';")
        conn.commit()

        # Enable autocommit mode for dropping tables
        conn.autocommit = True
        print("Dropping existing tables if they exist...")

        # List of tables to drop
        tables = [
            "LastTimestamp",
            "RoomSaves",
            "RoomDetails",
            "RoomOverview",
            "RoomReviews",
            "GroupCarts",
            "GroupMembers",
            "Groups",
            "GroupInvites"
        ]
        # Drop each table with autocommit enabled
        for table in tables:
            try:
                cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
                print(f"{table} table dropped successfully.")
            except Exception as e:
                print(f"Error dropping {table} table: {e}")

        # Disable autocommit mode for subsequent transactional control
        conn.autocommit = False

        #-----------------------------------------------------------------------

        # Re-create tables in a single transaction
        try:
            print("Creating tables...")

            # Create RoomOverview table with ResidentialCollege column
            cursor.execute('''
                CREATE TABLE "RoomOverview" (
                    "room_id" SERIAL PRIMARY KEY,
                    "room_number" TEXT,
                    "hall" TEXT,
                    "floor" INTEGER,
                    "isAvailable" BOOLEAN,
                    "residential_college" TEXT
                )
            ''')
            print("RoomOverview table created.")

            # Create RoomDetails table
            cursor.execute('''
                CREATE TABLE "RoomDetails" (
                    "room_id" INTEGER PRIMARY KEY REFERENCES "RoomOverview"("room_id"),
                    "occupancy" INTEGER,
                    "square_footage" INTEGER,
                    "num_saves" INTEGER DEFAULT 0
                )
            ''')
            print("RoomDetails table created.")

            # Create RoomSaves table
            cursor.execute('''
                CREATE TABLE "RoomSaves" (
                    "netid" TEXT,
                    "room_id" INTEGER REFERENCES "RoomOverview"("room_id"),
                    PRIMARY KEY ("netid", "room_id")
                )
            ''')
            print("RoomSaves table created.")

            # Create RoomReviews table
            cursor.execute('''
                CREATE TABLE "RoomReviews" (
                    "netid" TEXT,
                    "room_id" INTEGER REFERENCES "RoomOverview"("room_id"),
                    "rating" INTEGER CHECK ("rating" BETWEEN 1 AND 5),
                    "review_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "comments" TEXT,
                    PRIMARY KEY ("netid", "room_id")
                )
            ''')
            print("RoomReviews table created.")

            # Create LastTimestamp table
            cursor.execute('''
                CREATE TABLE "LastTimestamp" (
                    "last_timestamp" TEXT PRIMARY KEY
                )
            ''')
            print("LastTimestamp table created.")

            # Create Groups table without creator_netid column
            cursor.execute('''
                CREATE TABLE "Groups" (
                    "group_id" SERIAL PRIMARY KEY,
                    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            print("Groups table created.")

            # Create GroupMembers table
            cursor.execute('''
                CREATE TABLE "GroupMembers" (
                    "group_id" INTEGER REFERENCES "Groups"("group_id") ON DELETE CASCADE,
                    "netid" TEXT UNIQUE NOT NULL,
                    PRIMARY KEY ("group_id", "netid")
                )
            ''')
            print("GroupMembers table created.")

            # Create GroupCarts table
            cursor.execute('''
                CREATE TABLE "GroupCarts" (
                    "group_id" INTEGER REFERENCES "Groups"("group_id") ON DELETE CASCADE,
                    "room_id" INTEGER REFERENCES "RoomOverview"("room_id"),
                    PRIMARY KEY ("group_id", "room_id")
                )
            ''')
            print("GroupCarts table created.")

            # Create GroupInvites table
            cursor.execute('''
                CREATE TABLE "GroupInvites" (
                    "group_id" INTEGER REFERENCES "Groups"("group_id") ON DELETE CASCADE,
                    "invitee_netid" TEXT NOT NULL,
                    PRIMARY KEY ("group_id", "invitee_netid")
                )
            ''')
            print("GroupInvites table created.")

            conn.commit()  # Commit all create table operations at once
        except Exception as e:
            print(f"Error creating tables: {e}")
            conn.rollback()

        #-----------------------------------------------------------------------

        # Inserting initial 'N/A' timestamp
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

        # Populate RoomOverview and RoomDetails tables
        print("Populating room data...")
        room_data = []
        try:
            df = pd.read_excel('revised_Whitman.xlsx')
            grouped = df.groupby(['hall', 'floor'])
            for (hall, floor), group in grouped:
                group_dict = {
                    'residential_college': 'Whitman',
                    "hall": hall,
                    "floor": int(floor),
                    "room_numbers": group['room_number'].tolist(),
                    "occupancies": [int(o) for o in group['occupancy']],
                    "square_footages": [float(sf) for sf in group['square_footage']]
                }
                room_data.append(group_dict)
        except Exception as e:
            print(f"Error reading room data from Excel: {e}")
            raise

        # Insert room data into the tables
        for data in room_data:
            residential_college = data["residential_college"]
            hall = data["hall"]
            floor = data["floor"]
            room_numbers = data["room_numbers"]
            occupancies = data["occupancies"]
            square_footages = data["square_footages"]

            for i in range(len(room_numbers)):
                # Insert into RoomOverview
                cursor.execute(
                    '''
                    INSERT INTO "RoomOverview" ("room_number", "hall", "floor", "isAvailable", "residential_college")
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING "room_id"
                    ''',
                    (room_numbers[i], hall, floor, True, residential_college)
                )
                room_id = cursor.fetchone()[0]

                # Insert into RoomDetails
                cursor.execute(
                    '''
                    INSERT INTO "RoomDetails" ("room_id", "occupancy", "square_footage", "num_saves")
                    VALUES (%s, %s, %s, %s)
                    ''',
                    (room_id, occupancies[i], square_footages[i], 0)
                )
            conn.commit()
            print(f"Room data populated for {hall} Hall, Floor {floor}, College {residential_college}.")

        print("Database setup and initial data population complete.")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        # Close the cursor and connection
        cursor.close()
        conn.close()
        print("Database connection closed.")

# Run the script
if __name__ == "__main__":
    main()
