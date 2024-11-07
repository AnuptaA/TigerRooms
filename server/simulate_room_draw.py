import sqlite3
import random
import time

# Connect to the SQLite database
conn = sqlite3.connect('room_draw.db')
cursor = conn.cursor()

# Function to get all available rooms
def get_available_rooms():
    cursor.execute("SELECT room_id FROM RoomOverview WHERE isAvailable = True")
    available_rooms = cursor.fetchall()
    return [room[0] for room in available_rooms]  # List of room_ids

# Function to generate random user_id between 1 and 100
def get_random_user():
    return random.randint(1, 100)

# Function to save a room for a user
def save_room_for_user(user_id, room_id):
    # Update the number of saves for the room
    cursor.execute("UPDATE RoomDetails SET num_saves = num_saves + 1 WHERE room_id = ?", (room_id,))
    
    # Check if the user already exists in RoomSaves
    cursor.execute("SELECT saved_rooms FROM RoomSaves WHERE user_id = ?", (user_id,))
    result = cursor.fetchone()
    
    if result:
        # If the user already exists, update the saved rooms
        saved_rooms = result[0]
        if saved_rooms:
            saved_rooms_list = saved_rooms.split(',')
        else:
            saved_rooms_list = []
        saved_rooms_list.append(str(room_id))  # Add the new room to the saved list
        updated_saved_rooms = ','.join(saved_rooms_list)
        
        # Update the user's saved rooms in the database
        cursor.execute("UPDATE RoomSaves SET saved_rooms = ? WHERE user_id = ?", (updated_saved_rooms, user_id))
    else:
        # If the user does not exist, insert the user with the saved room
        cursor.execute("INSERT INTO RoomSaves (user_id, saved_rooms) VALUES (?, ?)", (user_id, str(room_id)))

# Main function to run the simulation
def simulate_room_draw():
    while True:
        # Step 1: Randomly select one available room and mark it as unavailable
        available_rooms = get_available_rooms()
        if available_rooms:
            chosen_room = random.choice(available_rooms)
            cursor.execute("UPDATE RoomOverview SET isAvailable = False WHERE room_id = ?", (chosen_room,))
            print(f"Room {chosen_room} has been drawn and marked as unavailable.")
        
        # Step 2: Generate random users
        user_1 = get_random_user()  # Random user 1
        user_2 = get_random_user()  # Random user 2
        
        # Step 3: One random user adds one save to a random room
        if available_rooms:
            random_room_1 = random.choice(available_rooms)
            save_room_for_user(user_1, random_room_1)
            print(f"User {user_1} saved room {random_room_1}.")
        
        # Step 4: Another random user adds two saves to two random rooms
        if len(available_rooms) >= 2:
            random_rooms_2 = random.sample(available_rooms, 2)
            for room in random_rooms_2:
                save_room_for_user(user_2, room)
            print(f"User {user_2} saved rooms {random_rooms_2[0]} and {random_rooms_2[1]}.")

        # Commit the changes to the database
        conn.commit()

        # Wait for 60 seconds before the next iteration
        time.sleep(60)

# Start the simulation
simulate_room_draw()

# Close the connection when the simulation is done (or stopped)
conn.close()
