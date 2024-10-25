#!/usr/bin/env python

#-----------------------------------------------------------------------
# pdfparser.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

# Usage: python update_database.py new_pdf.pdf

import sqlite3
import pandas as pd
import sys
from pdfparser import parse_pdf

# Connect to the SQLite database
conn = sqlite3.connect('room_draw.db')
cursor = conn.cursor()

# Function to print all rooms and their availability for debugging purposes
def print_room_availability():
    cursor.execute("SELECT room_number, isAvailable FROM RoomOverview")
    rooms = cursor.fetchall()

    print("Room Number | Availability")
    print("----------------------------")
    for room_number, is_available in rooms:
        availability = "Available" if is_available == 1 else "Unavailable"
        print(f"{room_number} | {availability}")

# Function to mark rooms as unavailable if they are not in the new PDF data
def update_room_availability(processed_table):
    # Get all current room numbers from the database
    cursor.execute("SELECT room_id, room_number FROM RoomOverview")
    current_rooms = cursor.fetchall()

    # Extract room numbers from the processed_table
    pdf_rooms = processed_table[2].tolist()

    # Iterate through the current rooms in the database
    for room_id, room_number in current_rooms:
        if room_number not in pdf_rooms:
            # If the room is not found in the PDF, mark it as unavailable
            cursor.execute("UPDATE RoomOverview SET isAvailable = 0 WHERE room_id = ?", (room_id,))
        else:
            # If the room is in the PDF, mark it as available (optional)
            cursor.execute("UPDATE RoomOverview SET isAvailable = 1 WHERE room_id = ?", (room_id,))

    # Commit changes to the database
    conn.commit()

def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <pdf_filepath>")
        sys.exit(1)
    
    # Get the filepath of the PDF
    filepath = sys.argv[1]
    
    # Parse the PDF using the parse_pdf function from pdfparser.py
    last_updated, processed_table = parse_pdf(filepath)
    
    # Update the room availability based on the new PDF data
    update_room_availability(processed_table)

    # Print out the room availability for debugging
    print_room_availability()

    print("Room availability updated based on PDF data.")
    
    # Close the database connection
    conn.close()

if __name__ == "__main__":
    main()
