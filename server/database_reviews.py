#-----------------------------------------------------------------------
# database_reviews.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
from database_saves import get_room_id
from db_config import DATABASE_URL

#-----------------------------------------------------------------------

def save_review(room_number, hall, netid, rating, comments, review_date):
    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor() as cursor:
            try:
                '''Submit a review (rating and comments) from a user 
                identified by netid for a room identified by '''
                room_id = get_room_id(room_number, hall, cursor)

                if room_id is None:
                    message = f"Room {room_number} in {hall} not found."
                    print(message)
                    return message

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

                message = f"Review by {netid} saved for room {room_number} in {hall}."
                print(message)
                return message
            
            except Exception as e:
                conn.rollback()
                message = f"Error saving room: {e}"
                print(message)
                return message


#-----------------------------------------------------------------------