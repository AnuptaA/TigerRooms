#-----------------------------------------------------------------------
# database_saves.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
from db_config import DATABASE_URL

#-----------------------------------------------------------------------

# temporary hashset for testing admin
admin_set = {"aa6328", "jm7048"}

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

def save_room(netid, room_number, hall):
    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor() as cursor:
            try:
                """Save a room for a user identified by netid, using room_number and hall."""
                room_id = get_room_id(room_number, hall, cursor)
                if room_id is None:
                    print(f"Room {room_number} in {hall} not found.")
                    return

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
                print(f"Room {room_number} in {hall} saved successfully for netid {netid}.")
            except Exception as e:
                conn.rollback()
                print("Error saving room:", e)

#-----------------------------------------------------------------------

def unsave_room(netid, room_number, hall):
    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor() as cursor:
            try:
                """Unsave a room for a user identified by netid, using room_number and hall."""
                room_id = get_room_id(room_number, hall, cursor)
                if room_id is None:
                    print(f"Room {room_number} in {hall} not found.")
                    return

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
                print(f"Room {room_number} in {hall} unsaved successfully for netid {netid}.")
            except Exception as e:
                conn.rollback()
                print("Error unsaving room:", e)

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
    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                '''
                SELECT r."room_number", r."hall", r."floor", d."num_saves", r."isAvailable"
                FROM "RoomOverview" r
                JOIN "RoomSaves" s ON r."room_id" = s."room_id"
                JOIN "RoomDetails" d ON r."room_id" = d."room_id"
                WHERE s."netid" = %s
                ''',
                (netid,)
            )
            rooms = cursor.fetchall()
    return [
        {
            "room_number": room[0],
            "hall": room[1],
            "floor": room[2],
            "total_saves": room[3],
            "availability": room[4]
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