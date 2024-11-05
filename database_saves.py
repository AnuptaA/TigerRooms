import psycopg2
from db_config import DATABASE_URL

# Connect to PostgreSQL database
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

def get_room_id(room_number, hall):
    """Retrieve the room_id for a specific room based on room_number and hall."""
    cursor.execute(
        '''
        SELECT room_id
        FROM RoomOverview
        WHERE room_number = %s AND hall = %s
        ''',
        (room_number, hall)
    )
    result = cursor.fetchone()
    return result[0] if result else None

def save_room(netid, room_number, hall):
    """Save a room for a user identified by netid, using room_number and hall."""
    # Retrieve the room_id based on room_number and hall
    room_id = get_room_id(room_number, hall)
    if room_id is None:
        print(f"Room {room_number} in {hall} not found.")
        return

    try:
        # Insert a save into RoomSaves table
        cursor.execute(
            '''
            INSERT INTO RoomSaves (netid, room_id)
            VALUES (%s, %s)
            ON CONFLICT (netid, room_id) DO NOTHING
            ''',
            (netid, room_id)
        )
        
        # Increment the num_saves in RoomDetails
        cursor.execute(
            '''
            UPDATE RoomDetails
            SET num_saves = num_saves + 1
            WHERE room_id = %s
            ''',
            (room_id,)
        )
        
        conn.commit()
        print(f"Room {room_number} in {hall} saved successfully for netid {netid}.")
    except Exception as e:
        conn.rollback()
        print("Error saving room:", e)

def get_total_saves(room_number, hall):
    """Retrieve the total number of saves for a specific room based on room_number and hall."""
    room_id = get_room_id(room_number, hall)
    if room_id is None:
        print("Room not found.")
        return 0
    
    cursor.execute(
        '''
        SELECT num_saves
        FROM RoomDetails
        WHERE room_id = %s
        ''',
        (room_id,)
    )
    result = cursor.fetchone()
    return result[0] if result else 0

def get_saved_rooms(netid):
    """Retrieve all rooms saved by a specific user identified by netid."""
    cursor.execute(
        '''
        SELECT r.room_number, r.hall, r.floor
        FROM RoomOverview r
        JOIN RoomSaves s ON r.room_id = s.room_id
        WHERE s.netid = %s
        ''',
        (netid,)
    )
    return cursor.fetchall()

# Example usage (comment out if not testing directly)
# Save a room and retrieve saves for different rooms and users
# save_room("netid1", "B320", "Wendell")  # Save room B320 for user with netid 'netid1'
# save_room("netid2", "B320", "Wendell")  # Save room B320 for user with netid 'netid2'
# print("Total saves for room B320:", get_total_saves("B320", "Wendell"))

# save_room("netid1", "B310", "Wendell")  # Save room B310 for user with netid 'netid1'
# print("Total saves for room B310:", get_total_saves("B310", "Wendell"))

# print("Saved rooms for netid1:", get_saved_rooms("netid1"))
# print("Saved rooms for netid2:", get_saved_rooms("netid2"))
