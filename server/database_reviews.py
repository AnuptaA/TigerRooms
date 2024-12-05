#-----------------------------------------------------------------------
# database_reviews.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
from db_config import DATABASE_URL

#-----------------------------------------------------------------------

def get_review(netid, room_id):
    '''
    Returns a dict with key success corresponding to boolean status of whether
    the fetching of review data (rating, comments, review_date), for room  with
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
                    ''', (netid, room_id)
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
    '''
    Returns a string corresponding to whether the saving of a review for 
    a room with room_id by user with netid was a success or failure.
    '''
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
            
def get_reviews(room_id):
    '''
    Returns dict with key success corresponding to a boolean status of whether
    the fetching of reviews for room with room_id by all users was a success.
    If true, returns list of review objects containing review data (netid,
    rating, comments, and review_date) in descending order of review 
    submission time otherwise returns appropriate error message.
    '''
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    '''
                    SELECT "netid", "rating", "comments", "review_date"
                    FROM "RoomReviews"
                    WHERE "room_id" = %s
                    ORDER BY "review_date" DESC
                    ''', (room_id,)
                )

                # Fetch the result
                result = cursor.fetchall()
                print(f"Query Result: ", result)

                reviews = []

                for row in result:
                    review = {}
                    review['netid'] = row[0]
                    review['rating'] = row[1]
                    review['comments'] = row[2]
                    review['review_date'] = row[3]
                    reviews.append(review)

                return {"success": True, "reviews": reviews}

    
    except Exception as ex:
        message = f"Error fetching reviews for Room {room_id}: {ex}"
        print(message)
        return {"success": False, "error": message }
            
#-----------------------------------------------------------------------

def get_all_user_reviews(netid):
    '''
    Returns dict with key success corresponding to a boolean status of whether
    the fetching of reviews for user with netid was successful. If true, returns
    list of review objects containing review data (room_id, rating, comments, and
    review_date) in descending order of review submission time otherwise returns
    appropriate error message.
    '''
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    '''
                    SELECT "room_id", "rating", "comments", "review_date"
                    FROM "RoomReviews"
                    WHERE "netid" = %s
                    ORDER BY "review_date" DESC
                    ''', (netid,)
                )

                # Fetch the result
                result = cursor.fetchall()
                print(f"Queery Result: ", result)

                reviews = []

                for row in result:
                    review = {}
                    review['room_id'] = row[0]
                    review['rating'] = row[1]
                    review['comments'] = row[2]
                    review['review_date'] = row[3]
                    reviews.append(review)

                return {"success": True, "reviews": reviews}
            
    except Exception as ex:
        message = f"Error fetching reviews for User {netid}: {ex}"
        print(message)
        return {"success": False, "error": message}
    
#-----------------------------------------------------------------------
    
def get_all_db_reviews():
    '''
    '''
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    '''
                    SELECT "netid", "room_id", "rating", "comments", "review_date"
                    FROM "RoomReviews"
                    ORDER BY "review_date" DESC
                    '''
                )

                # Fetch the result
                result = cursor.fetchall()
                print(f"Query Result: ", result)

                all_reviews = []

                for row in result:
                    review = {}
                    review['netid'] = row[0]
                    review['room_id'] = row[1]
                    review['rating'] = row[2]
                    review['comments'] = row[4]
                    review['review_date'] = row[3]
                    all_reviews.append(review)

                return {"success": True, "all_reviews": all_reviews}
    
    except Exception as ex:
        message = f"Error occurred while fetching all reviews: {ex}"
        print(message)
        return {"success": False, "error": message}
    
#-----------------------------------------------------------------------