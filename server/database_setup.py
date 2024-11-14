#-----------------------------------------------------------------------
# database_setup.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
from db_config import DATABASE_URL

print(DATABASE_URL)

def main():
    try:
        # Connect to PostgreSQL database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        print("Connected to the database.")

        # Drop tables in the correct order with explicit transactions
        print("Dropping existing tables if they exist...")

        tables = ["LastTimestamp", "RoomSaves", "RoomDetails", "RoomOverview"]
        for table in tables:
            try:
                cursor.execute(f'DROP TABLE IF EXISTS "{table}"')
                conn.commit()  # Commit each drop to close transactions
                print(f"{table} table dropped successfully.")
            except Exception as e:
                print(f"Error dropping {table} table: {e}")
                conn.rollback()  # Roll back any issues to maintain consistency

        #-----------------------------------------------------------------------

        # Create tables
        print("Creating RoomOverview table...")
        cursor.execute('''
            CREATE TABLE "RoomOverview" (
                "room_id" SERIAL PRIMARY KEY,
                "room_number" TEXT,
                "hall" TEXT,
                "floor" INTEGER,
                "isAvailable" BOOLEAN
            )
        ''')
        conn.commit()
        print("RoomOverview table created.")

        print("Creating RoomDetails table...")
        cursor.execute('''
            CREATE TABLE "RoomDetails" (
                "room_id" INTEGER PRIMARY KEY REFERENCES "RoomOverview"("room_id"),
                "occupancy" INTEGER,
                "square_footage" INTEGER,
                "num_saves" INTEGER DEFAULT 0
            )
        ''')
        conn.commit()
        print("RoomDetails table created.")

        print("Creating RoomSaves table...")
        cursor.execute('''
            CREATE TABLE "RoomSaves" (
                "netid" TEXT,
                "room_id" INTEGER REFERENCES "RoomOverview"("room_id"),
                PRIMARY KEY ("netid", "room_id")
            )
        ''')
        conn.commit()
        print("RoomSaves table created.")

        print("Creating LastTimestamp table...")
        cursor.execute('''
            CREATE TABLE "LastTimestamp" (
                "last_timestamp" TEXT PRIMARY KEY
            )
        ''')
        conn.commit()
        print("LastTimestamp table created.")

        #-----------------------------------------------------------------------

        print("Inserting initial 'N/A' timestamp...")
        # Insert 'N/A' as the initial value for last_timestamp
        cursor.execute('''
            INSERT INTO "LastTimestamp" ("last_timestamp") 
            VALUES ('N/A')
            ON CONFLICT ("last_timestamp") DO NOTHING
        ''')
        conn.commit()
        print("Initial 'N/A' timestamp inserted.")

        #-----------------------------------------------------------------------

        print("Populating RoomOverview with mock data...")
        # Populate RoomOverview table with mock data
        hall = 'Wendell'  # Wendell B specifically
        floor = 3
        isAvailable = True
        room_numbers = ['B320', 'B318', 'B316', 'B314', 'B312', 'B310', 'B308', 'B317', 'B315', 'B313', 'B311', 'B309']
        occupancies = [4, 4, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4]
        square_footages = [460, 517, 148, 484, 152, 148, 175, 115, 484, 115, 115, 512]

        for i in range(len(room_numbers)):
            cursor.execute(
                '''
                INSERT INTO "RoomOverview" ("room_number", "hall", "floor", "isAvailable")
                VALUES (%s, %s, %s, %s)
                ON CONFLICT ("room_id") DO NOTHING
                ''',
                (room_numbers[i], hall, floor, isAvailable)
            )
        conn.commit()
        print("RoomOverview table populated with mock data.")

        print("Populating RoomDetails with mock data...")
        for i in range(len(room_numbers)):
            cursor.execute(
                '''
                INSERT INTO "RoomDetails" ("room_id", "occupancy", "square_footage", "num_saves")
                VALUES (%s, %s, %s, %s)
                ON CONFLICT ("room_id") DO NOTHING
                ''',
                (i + 1, occupancies[i], square_footages[i], 0)
            )
        conn.commit()
        print("RoomDetails table populated with mock data.")

        #-----------------------------------------------------------------------

        print("Database setup and initial data population complete.")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        # Close the connection
        conn.close()
        print("Database connection closed.")

# Call main() if this script is executed directly
if __name__ == "__main__":
    main()
