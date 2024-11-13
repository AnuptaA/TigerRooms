#-----------------------------------------------------------------------
# update_database.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
import pandas as pd
import sys
from pdfparser import parse_pdf
from db_config import DATABASE_URL

#-----------------------------------------------------------------------

# Connect to the PostgreSQL database
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

#-----------------------------------------------------------------------

# Function to print all rooms and their availability for debugging purposes
def print_room_availability():
    cursor.execute("SELECT room_number, isAvailable FROM RoomOverview")
    rooms = cursor.fetchall()

    print("Room Number | Availability")
    print("----------------------------")
    for room_number, is_available in rooms:
        availability = "Available" if is_available else "Unavailable"
        print(f"{room_number} | {availability}")

#-----------------------------------------------------------------------

# Function to mark rooms as unavailable if they are not in the new PDF data
def update_room_availability(processed_table):
    cursor.execute("SELECT room_id, room_number FROM RoomOverview")
    current_rooms = cursor.fetchall()

    pdf_rooms = processed_table[2].tolist()

    for room_id, room_number in current_rooms:
        cursor.execute(
            "UPDATE RoomOverview SET isAvailable = %s WHERE room_id = %s",
            (room_number in pdf_rooms, room_id)
        )
    conn.commit()

#-----------------------------------------------------------------------
    
# Function to update the stored timestamp with the new given timestamp
def update_timestamp(last_updated):
    cursor.execute("DELETE FROM LastTimestamp")
    cursor.execute(
        """
        INSERT INTO LastTimestamp (last_timestamp) VALUES (%s)
        ON CONFLICT (last_timestamp) DO UPDATE SET last_timestamp = EXCLUDED.last_timestamp
        """,
        (last_updated,)
    )
    conn.commit()

#-----------------------------------------------------------------------

# Function to get the last update time from the database
def get_last_update_time():
    cursor.execute("SELECT last_timestamp FROM LastTimestamp")
    result = cursor.fetchone()
    
    return result[0] if result else "N/A"  # Default value if no record is found

#-----------------------------------------------------------------------

def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <pdf_filepath>")
        sys.exit(1)

    filepath = sys.argv[1]
    last_updated, processed_table = parse_pdf(filepath)
    
     # Load the last update time from DB
    update_time = get_last_update_time()
    print("Old update_time =", update_time)

    update_time = last_updated

    # Persist the new update time to the DB
    update_timestamp(update_time)
    print("New update_time =", get_last_update_time())

    update_room_availability(processed_table)
    print_room_availability()
    conn.close()

#-----------------------------------------------------------------------

if __name__ == "__main__":
    main()
