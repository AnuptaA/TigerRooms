#-----------------------------------------------------------------------
# database_saves.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
from db_config import DATABASE_URL
from update_database import get_connection, return_connection

#-----------------------------------------------------------------------

# hashset for testing admin, remove any of our netids at the end
admin_set = {'cs-js2694', 'cs-rdondero', 'cs-oe7583', 'ky6374', 'jm7048', 'rm6982'}

# Remove one netid from this set later, since we can only send emails to 5 verified users
# Also remove all of our group's netids
email_set = {'cs-rdondero', 'cs-oe7583', 'js2694', 'rdondero', 'oe7583', 'ky6374', 'aa6328', 'jm7048', 'rm6982', 'ak9157'}

#-----------------------------------------------------------------------

def get_room_id(room_number, hall, cursor):
    """Retrieve the room_id for a specific room based on room_number and hall."""
    cursor.execute(
        '''
        SELECT "room_id"
        FROM "RoomOverview"
        WHERE "room_number" = %s AND "hall" = %s
        ''',
        (room_number, hall)
    )
    result = cursor.fetchone()
    return result[0] if result else None

#-----------------------------------------------------------------------

def save_room(netid, room_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        """Save a room for a user identified by netid, using room_number and hall."""
        # Check if the room is available
        cursor.execute(
            '''
            SELECT "isAvailable"
            FROM "RoomOverview"
            WHERE "room_id" = %s
            ''',
            (room_id,)
        )
        room = cursor.fetchone()
        if not room or not room[0]:  # Availability is indicated by `True`
            print(f"Room {room_id} is not available and cannot be saved.")
            return

        # Insert the save if the room is available
        cursor.execute(
            '''
            INSERT INTO "RoomSaves" ("netid", "room_id")
            VALUES (%s, %s)
            ON CONFLICT ("netid", "room_id") DO NOTHING
            ''',
            (netid, room_id)
        )
        cursor.execute(
            '''
            UPDATE "RoomDetails"
            SET "num_saves" = "num_saves" + 1
            WHERE "room_id" = %s
            ''',
            (room_id,)
        )
        conn.commit()
        print(f"Room {room_id} saved successfully for netid {netid}.")
    except Exception as e:
        conn.rollback()
        print("Error saving room:", e)
    finally:
        # Close the connection and return it to the pool
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

def unsave_room(netid, room_id):
    conn = get_connection()
    cursor = conn.cursor()
    print("YIKERS")

    try:
        """Unsave a room for a user identified by netid, using room_number and hall."""

        cursor.execute(
            '''
            DELETE FROM "RoomSaves"
            WHERE "netid" = %s AND "room_id" = %s
            ''',
            (netid, room_id)
        )

        if cursor.rowcount > 0:
            cursor.execute(
                '''
                UPDATE "RoomDetails"
                SET "num_saves" = "num_saves" - 1
                WHERE "room_id" = %s AND "num_saves" > 0
                ''',
                (room_id,)
            )
        conn.commit()
        print(f"Room {room_id} unsaved successfully for netid {netid}.")
    except Exception as e:
        conn.rollback()
        print("Error unsaving room:", e)
    finally:
        # Close the curson and return the conn to the pool
        cursor.close()
        return_connection(conn)

#-----------------------------------------------------------------------

def get_total_saves(room_number, hall, cursor):
    """Retrieve the total number of saves for a specific room based on room_number and hall."""
    room_id = get_room_id(room_number, hall, cursor)
    if room_id is None:
        print(f"Room {room_id} not found.")
        return 0

    cursor.execute(
        '''
        SELECT "num_saves"
        FROM "RoomDetails"
        WHERE "room_id" = %s
        ''',
        (room_id,)
    )
    result = cursor.fetchone()
    return result[0] if result else 0

#-----------------------------------------------------------------------

def get_saved_rooms_with_saves_and_availability(netid):
    """Retrieve all rooms saved by a specific user identified by netid, including total saves and availability for each room."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        '''
        SELECT r."room_id", r."room_number", r."hall", r."floor", d."num_saves", r."isAvailable"
        FROM "RoomOverview" r
        JOIN "RoomSaves" s ON r."room_id" = s."room_id"
        JOIN "RoomDetails" d ON r."room_id" = d."room_id"
        WHERE s."netid" = %s
        ''',
        (netid,)
    )

    rooms = cursor.fetchall()

    cursor.close()
    return_connection(conn)

    return [
        {
            "room_id": room[0],
            "room_number": room[1],
            "hall": room[2],
            "floor": room[3],
            "total_saves": room[4],
            "availability": room[5]
        }
        for room in rooms
    ]

#-----------------------------------------------------------------------

def is_room_saved(netid, room_number, hall, cursor):
    """Check if a specific room is saved by the user with the given netid."""
    room_id = get_room_id(room_number, hall, cursor)
    if room_id is None:
        print(f"Room {room_number} in {hall} not found.")
        return False

    cursor.execute('SET TRANSACTION READ ONLY')
    cursor.execute(
        '''
        SELECT 1
        FROM "RoomSaves"
        WHERE "netid" = %s AND "room_id" = %s
        ''',
        (netid, room_id)
    )
    result = cursor.fetchone()
    return result is not None

#-----------------------------------------------------------------------

def is_admin(netid):
    ''''Check if a given user is an admin, return true if they are an admin, false otherwise.'''
    if netid in admin_set:
        return True
    return False

#-----------------------------------------------------------------------

def can_email(netid):
    ''''Check if a given user is able to be emailed, return true if they are, false otherwise.'''
    if netid in email_set:
        return True
    return False