#-----------------------------------------------------------------------
# database_saves.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
from db_config import DATABASE_URL

#-----------------------------------------------------------------------

# Connect to PostgreSQL database
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

#-----------------------------------------------------------------------

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

#-----------------------------------------------------------------------

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

#-----------------------------------------------------------------------

def unsave_room(netid, room_number, hall):
    """Unsave a room for a user identified by netid, using room_number and hall."""
    room_id = get_room_id(room_number, hall)
    if room_id is None:
        print(f"Room {room_number} in {hall} not found.")
        return

    try:
        # Delete the save from RoomSaves table
        cursor.execute(
            '''
            DELETE FROM RoomSaves
            WHERE netid = %s AND room_id = %s
            ''',
            (netid, room_id)
        )

        # Decrement the num_saves in RoomDetails if the delete was successful
        if cursor.rowcount > 0:  # Check if a row was deleted
            cursor.execute(
                '''
                UPDATE RoomDetails
                SET num_saves = num_saves - 1
                WHERE room_id = %s AND num_saves > 0
                ''',
                (room_id,)
            )
        
        conn.commit()
        print(f"Room {room_number} in {hall} unsaved successfully for netid {netid}.")
    except Exception as e:
        conn.rollback()
        print("Error unsaving room:", e)

#-----------------------------------------------------------------------

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

#-----------------------------------------------------------------------

def get_saved_rooms_with_saves(netid):
    """Retrieve all rooms saved by a specific user identified by netid, including total saves for each room."""
    cursor.execute(
        '''
        SELECT r.room_number, r.hall, r.floor, d.num_saves
        FROM RoomOverview r
        JOIN RoomSaves s ON r.room_id = s.room_id
        JOIN RoomDetails d ON r.room_id = d.room_id
        WHERE s.netid = %s
        ''',
        (netid,)
    )
    rooms = cursor.fetchall()
    return [
        {"room_number": room[0], "hall": room[1], "floor": room[2], "total_saves": room[3]}
        for room in rooms
    ]

#-----------------------------------------------------------------------

def is_room_saved(netid, room_number, hall):
    """Check if a specific room is saved by the user with the given netid."""
    room_id = get_room_id(room_number, hall)
    if room_id is None:
        print(f"Room {room_number} in {hall} not found.")
        return False

    cursor.execute(
        '''
        SELECT 1
        FROM RoomSaves
        WHERE netid = %s AND room_id = %s
        ''',
        (netid, room_id)
    )
    result = cursor.fetchone()
    return result is not None

#-----------------------------------------------------------------------

# Example usage (comment out if not testing directly)
def test():
    print("Starting database operations...\n")

    # User actions
    save_room("netid1", "B320", "Wendell")  # netid1 saves room B320
    save_room("netid2", "B320", "Wendell")  # netid2 saves room B320
    save_room("netid3", "B320", "Wendell")  # netid3 saves room B320
    print("Total saves for room B320 after three saves:", get_total_saves("B320", "Wendell"))
    # Expected output: Total saves for room B320 after three saves: 3

    # Additional rooms saved by different users
    save_room("netid1", "B310", "Wendell")  # netid1 saves room B310
    save_room("netid2", "B310", "Wendell")  # netid2 saves room B310
    save_room("netid3", "B308", "Wendell")  # netid3 saves room B308
    print("Total saves for room B310 after two saves:", get_total_saves("B310", "Wendell"))
    # Expected output: Total saves for room B310 after two saves: 2
    print("Total saves for room B308 after one save:", get_total_saves("B308", "Wendell"))
    # Expected output: Total saves for room B308 after one save: 1

    # Check saved rooms for each user
    print("\nSaved rooms for netid1:", get_saved_rooms_with_saves("netid1"))
    # Expected output: Saved rooms for netid1: [('B320', 'Wendell', 3), ('B310', 'Wendell', 3)]
    print("Saved rooms for netid2:", get_saved_rooms_with_saves("netid2"))
    # Expected output: Saved rooms for netid2: [('B320', 'Wendell', 3), ('B310', 'Wendell', 3)]
    print("Saved rooms for netid3:", get_saved_rooms_with_saves("netid3"))
    # Expected output: Saved rooms for netid3: [('B320', 'Wendell', 3), ('B308', 'Wendell', 3)]

    # Unsave operations
    unsave_room("netid1", "B320", "Wendell")  # netid1 unsaves room B320
    print("\nTotal saves for room B320 after netid1 unsaves:", get_total_saves("B320", "Wendell"))
    # Expected output: Total saves for room B320 after netid1 unsaves: 2

    unsave_room("netid2", "B310", "Wendell")  # netid2 unsaves room B310
    print("Total saves for room B310 after netid2 unsaves:", get_total_saves("B310", "Wendell"))
    # Expected output: Total saves for room B310 after netid2 unsaves: 1

    # More unsaves to observe changes
    unsave_room("netid3", "B308", "Wendell")  # netid3 unsaves room B308
    print("Total saves for room B308 after netid3 unsaves:", get_total_saves("B308", "Wendell"))
    # Expected output: Total saves for room B308 after netid3 unsaves: 0

    # Final saved rooms for each user after unsave operations
    print("\nFinal saved rooms for netid1:", get_saved_rooms_with_saves("netid1"))
    # Expected output: Final saved rooms for netid1: [('B310', 'Wendell', 3)]
    print("Final saved rooms for netid2:", get_saved_rooms_with_saves("netid2"))
    # Expected output: Final saved rooms for netid2: [('B320', 'Wendell', 3)]
    print("Final saved rooms for netid3:", get_saved_rooms_with_saves("netid3"))
    # Expected output: Final saved rooms for netid3: [('B320', 'Wendell', 3)]

    # Check total saves to ensure integrity
    print("\nFinal total saves:")
    print("Room B320:", get_total_saves("B320", "Wendell"))
    # Expected output: Room B320: 2
    print("Room B310:", get_total_saves("B310", "Wendell"))
    # Expected output: Room B310: 1
    print("Room B308:", get_total_saves("B308", "Wendell"))
    # Expected output: Room B308: 0

# save_room("user123", "B309", "Wendell")  # user123 saves room B309
# save_room("user123", "B310", "Wendell")  # user123 saves room B310
# print("User user123 has the following room saves", get_saved_rooms_with_saves("user123"))
# test()
