#-----------------------------------------------------------------------
# database_reviews.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
from database_saves import get_room_id
from db_config import DATABASE_URL

#-----------------------------------------------------------------------

def get_review(netid, room_id):
    '''
    Returns a dict with key success corresponding to boolean status of whether
    the fetching of review data (rating, comments, review_data), for room  with
    room_id by user with netid was a success. If true, returns object 
    containing review data otherwise returns appropriate error message.
    '''
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    '''
                    SELECT "rating", "comments", "review_date"
                    FROM "RoomReviews"
                    WHERE "netid" = %s AND "room_id" = %s
                    ''',
                    (netid, room_id)
                )

                # Fetch the result
                result = cursor.fetchone()
                print(f"Query result: {result}")

                # Check if the review exists
                if result:
                    review = {
                        'rating': result[0],
                        'comments': result[1],
                        'review_date': result[2]
                    }
                    return {"success": True, "review": review}
                else:
                    return {"success": False, "error": "Review not found"}

    except Exception as ex:
        message = f"Error fetching {netid}'s review for room {room_id}: {ex}"
        print(message)
        return {"success": False, "error": message}

#-----------------------------------------------------------------------
    
def delete_review(netid, room_id):
    '''
    Returns a string corresponding to whether the deletion of a review for 
    a room with room_id by user with netid was a success or failure.
    '''
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    '''
                    DELETE FROM "RoomReviews"
                    WHERE "netid" = %s AND "room_id" = %s
                    ''',
                    (netid, room_id)
                )

                conn.commit()
                message = f"Review for Room {room_id} by {netid} was successfully deleted."
                print(message)
                return message

    except Exception as ex:
        message = f"Error deleting {netid}'s review for room {room_id}: {ex}"
        print(message)
        return message
    
#-----------------------------------------------------------------------

def save_review(room_id, netid, rating, comments, review_date):
    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor() as cursor:
            try:
                cursor.execute(
                    '''
                    INSERT INTO "RoomReviews" ("netid", "room_id", "rating", "comments", "review_date")
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT ("netid", "room_id") 
                    DO UPDATE SET 
                        "rating" = EXCLUDED."rating", 
                        "comments" = EXCLUDED."comments", 
                        "review_date" = EXCLUDED."review_date";
                    ''', (netid, room_id, rating, comments, review_date)
                )

                conn.commit()

                message = f"Review by {netid} saved for room {room_id}."
                print(message)
                return message
            
            except Exception as ex:
                conn.rollback()
                message = f"Error saving room: {ex}"
                print(message)
                return message

#-----------------------------------------------------------------------