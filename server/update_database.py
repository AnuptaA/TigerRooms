#-----------------------------------------------------------------------
# update_database.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
from psycopg2 import pool
import pandas as pd
import sys
from pdfparser import parse_pdf
from db_config import DATABASE_URL
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

#-----------------------------------------------------------------------
# Load environment variables from .env file
load_dotenv()

# Initialize the connection pool (size of the pool can be adjusted based on need)
conn_pool = psycopg2.pool.SimpleConnectionPool(
    1, 15, DATABASE_URL)  # minconn=1, maxconn=10

print("Database connection pool initialized.")

#-----------------------------------------------------------------------

# Function to get a connection from the pool
def get_connection():
    print("Getting a database connection from the pool.")
    return conn_pool.getconn()

# Function to return a connection to the pool
def return_connection(conn):
    print("Returning the connection to the pool.")
    conn_pool.putconn(conn)

#-----------------------------------------------------------------------

# Function to print all rooms and their availability for debugging purposes
def print_room_availability():
    print("Fetching all rooms and their availability.")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT "room_number", "isAvailable" FROM "RoomOverview"')
    rooms = cursor.fetchall()

    print("Room Number | Availability")
    print("----------------------------")
    for room_number, is_available in rooms:
        availability = "Available" if is_available else "Unavailable"
        print(f"{room_number} | {availability}")

    cursor.close()
    return_connection(conn)

#-----------------------------------------------------------------------

# Function to take a snapshot of available rooms
def take_snapshot():
    print("Taking a snapshot of currently available rooms.")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT "room_id", "hall", "room_number"
        FROM "RoomOverview"
        WHERE "isAvailable" = TRUE
    ''')
    snapshot = cursor.fetchall()
    print(f"Snapshot taken: {len(snapshot)} rooms available.")
    cursor.close()
    return_connection(conn)
    return [{"room_id": row[0], "hall": row[1], "room_number": row[2]} for row in snapshot]

#-----------------------------------------------------------------------

# Function to update room availability and find newly unavailable rooms
def update_room_availability_and_find_changes(processed_table, snapshot):
    print("Updating room availability and identifying newly unavailable rooms.")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT "room_id", "room_number" FROM "RoomOverview"')
    current_rooms = cursor.fetchall()

    pdf_rooms = processed_table[2].tolist()
    newly_unavailable = []
    print(f"Processing {len(current_rooms)} rooms from the database.")

    for room_id, room_number in current_rooms:
        is_now_available = room_number in pdf_rooms
        cursor.execute(
            '''
            UPDATE "RoomOverview"
            SET "isAvailable" = %s
            WHERE "room_id" = %s
            ''',
            (is_now_available, room_id)
        )

        if not is_now_available:
            for snap in snapshot:
                if snap["room_id"] == room_id:
                    newly_unavailable.append(snap)
                    break

    conn.commit()
    print(f"Newly unavailable rooms identified: {len(newly_unavailable)}")
    cursor.close()
    return_connection(conn)
    return newly_unavailable

#-----------------------------------------------------------------------

# Function to notify users and update carts for newly unavailable rooms
def notify_users_and_update_carts(newly_unavailable, past_timestamp, current_timestamp):
    if not newly_unavailable:
        print("No rooms became unavailable.")
        return

    print("Notifying users about drawn rooms.")
    conn = get_connection()
    cursor = conn.cursor()

    # Dictionary to collect rooms per user
    user_rooms = {}

    for room in newly_unavailable:
        print(f"Processing room {room['room_number']} in {room['hall']}.")
        cursor.execute('''
            SELECT "netid"
            FROM "RoomSaves"
            WHERE "room_id" = %s
        ''', (room["room_id"],))
        users = cursor.fetchall()
        print(f"Users affected: {len(users)}")

        for user in users:
            netid = user[0]
            if netid not in user_rooms:
                user_rooms[netid] = []
            user_rooms[netid].append(room)

    # Commit to ensure changes, even though we don't delete rows now
    conn.commit()

    # Send one email per user with all their affected rooms
    for netid, rooms in user_rooms.items():
        print(f"Notifying user {netid} about {len(rooms)} rooms.")
        room_list = "\n".join([f"{room['hall']} {room['room_number']}" for room in rooms])
        email_body = (
            f"Dear {netid},\n\n"
            f"The following rooms you saved have been drawn and are no longer available:\n"
            f"{room_list}\n\n"
            f"They will now appear at the bottom of your saved rooms table in your cart.\n"
            f"If you no longer need these drawn rooms for reference, you can remove them at any time.\n\n"
            f"This update reflects the transition from the previous timestamp {past_timestamp} to the current timestamp {current_timestamp}.\n\n"
            f"View your saved rooms here: https://tigerrooms-l48h.onrender.com/\n\n"
            f"Best regards,\n"
            f"TigerRooms Team"
        )

        send_email(
            to_email=f"{netid}@princeton.edu",
            subject="[TigerRooms] - Saved Rooms Drawn",
            body=email_body
        )

    print("Notifications sent to users about drawn rooms.")
    cursor.close()
    return_connection(conn)

#-----------------------------------------------------------------------

# Function to send email notifications
def send_email(to_email, subject, body):
    print(f"Sending email to {to_email} with subject '{subject}'.")
    try:
        smtp_server = "smtp.gmail.com"
        smtp_port = 587

        # Load credentials from environment variables
        from_email = os.getenv("EMAIL_ADDRESS")
        app_password = os.getenv("EMAIL_APP_PASSWORD")

        if not from_email or not app_password:
            raise ValueError("Email credentials are not set in environment variables.")

        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(from_email, app_password)
            server.sendmail(from_email, to_email, msg.as_string())

        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")

#-----------------------------------------------------------------------

# Function to update the stored timestamp with the new given timestamp
def update_timestamp(last_updated):
    print(f"Updating timestamp to {last_updated}.")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM "LastTimestamp"')
    cursor.execute(
        '''
        INSERT INTO "LastTimestamp" ("last_timestamp") VALUES (%s)
        ''',
        (last_updated,)
    )
    conn.commit()
    cursor.close()
    return_connection(conn)
    print("Timestamp updated in database.")

#-----------------------------------------------------------------------

# Improved function to get the last update time from the database as a datetime object
def get_last_update_time():
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT "last_timestamp" FROM "LastTimestamp"')
        result = cursor.fetchone()
        cursor.close()
        return_connection(conn)

        # Check if a result is found and return it as a datetime object in the expected format
        if result and result[0] != "N/A":
            try:
                # Parse the timestamp from the format in which it was stored
                return datetime.strptime(result[0], '%m/%d/%Y %I:%M %p')
            except ValueError as e:
                print(f"Error parsing stored timestamp: {e}")
                return None  # Handle the parsing error gracefully
        else:
            # Return "N/A" to indicate no valid timestamp found
            return "N/A"
    except Exception as e:
        print(f"An error occurred while fetching last update time: {e}")
        return None

#-----------------------------------------------------------------------

def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <pdf_filepath>")
        sys.exit(1)

    filepath = sys.argv[1]

    try:
        # Parse the PDF file
        last_updated, processed_table = parse_pdf(filepath)

        # Convert last_updated from the PDF to a datetime object using the expected format
        last_updated_dt = datetime.strptime(last_updated, '%m/%d/%Y %I:%M %p')

        # Load the last update time from DB
        update_time = get_last_update_time()
        print("Existing update_time:", update_time)

        # Transform timestamps into desired formats
        past_timestamp = (
            update_time.strftime("%m/%d/%Y %I:%M %p")
            if isinstance(update_time, datetime) else "N/A"
        )

        # Proceed with update if current timestamp is "N/A" or older than last_updated
        if update_time == "N/A" or last_updated_dt > update_time:
            print("New timestamp is more recent. Proceeding with update.")

            # Take a snapshot of available rooms
            snapshot = take_snapshot()

            # Update room availability and find newly unavailable rooms
            newly_unavailable = update_room_availability_and_find_changes(processed_table, snapshot)

            # Notify users and update carts
            notify_users_and_update_carts(newly_unavailable, past_timestamp, last_updated)

            # Update timestamp
            update_timestamp(last_updated)  # Store in original format
        else:
            print("NO_UPDATE: New timestamp is not more recent than the current timestamp.")
            sys.exit(0)

        print_room_availability()

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        # Ensure the database connection is always closed
        print("Database connection pool closed.")

#-----------------------------------------------------------------------

if __name__ == "__main__":
    main()
