#-----------------------------------------------------------------------
# database_reviews.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
from database_saves import get_room_id
from db_config import DATABASE_URL

#-----------------------------------------------------------------------

def get_review_of_user(netid, room_id):
    '''
    Returns the review data (rating, comments, review_date) for a given room_id 
    that a user with netid has reviewed.
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