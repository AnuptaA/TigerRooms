#-----------------------------------------------------------------------
# update_database.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
import pandas as pd
import sys
from pdfparser import parse_pdf
from db_config import DATABASE_URL
from datetime import datetime

#-----------------------------------------------------------------------

# Connect to PostgreSQL database
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
    print("Room availability updated.")

#-----------------------------------------------------------------------

# Function to update the stored timestamp with the new given timestamp
def update_timestamp(last_updated):
    cursor.execute("DELETE FROM LastTimestamp")
    cursor.execute(
        """
        INSERT INTO LastTimestamp (last_timestamp) VALUES (%s)
        """,
        (last_updated,)
    )
    conn.commit()
    print("Timestamp updated in database.")

#-----------------------------------------------------------------------

# Function to get the last update time from the database as a datetime object
def get_last_update_time():
    cursor.execute("SELECT last_timestamp FROM LastTimestamp")
    result = cursor.fetchone()

    # Check if a result is found and return it as a datetime object in the expected format
    if result and result[0] != "N/A":
        try:
            # Parse the timestamp from the format in which it was stored
            return datetime.strptime(result[0], '%m/%d/%Y %I:%M %p')
        except ValueError as e:
            print(f"Error parsing stored timestamp: {e}")
            sys.exit(1)
    else:
        # Return "N/A" to indicate no valid timestamp found
        return "N/A"

#-----------------------------------------------------------------------

def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <pdf_filepath>")
        sys.exit(1)

    filepath = sys.argv[1]
    last_updated, processed_table = parse_pdf(filepath)
    
    # Convert last_updated from the PDF to a datetime object using the expected format
    last_updated_dt = datetime.strptime(last_updated, '%m/%d/%Y %I:%M %p')
    
    # Load the last update time from DB
    update_time = get_last_update_time()
    print("Existing update_time:", update_time)

    # Proceed with update if current timestamp is "N/A" or older than last_updated
    if update_time == "N/A":
        print("Initial state detected (N/A). Proceeding with update.")
        update_room_availability(processed_table)
        update_timestamp(last_updated)  # Store in original format
    else:
        # Compare the datetime objects directly
        if last_updated_dt > update_time:
            print("New timestamp is more recent. Proceeding with update.")
            update_room_availability(processed_table)
            update_timestamp(last_updated)  # Store in original format
        else:
            print("NO_UPDATE: New timestamp is not more recent than the current timestamp.")
            sys.exit(0)  # Exit without an update status

    print_room_availability()
    conn.close()

#-----------------------------------------------------------------------

if __name__ == "__main__":
    main()
