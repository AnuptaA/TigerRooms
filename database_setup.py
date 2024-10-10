import sqlite3

# Initial database based on: https://princetonu.sharepoint.com/sites/uservices/housing/floorplans/undergraduate/UnderGrad_dorms/0669-03.pdf

# Connect to SQLite database (create the file if it doesn't exist)
conn = sqlite3.connect('room_draw.db')
cursor = conn.cursor()

# Create RoomOverview table
cursor.execute('''CREATE TABLE IF NOT EXISTS RoomOverview (
                    room_id INTEGER PRIMARY KEY,
                    room_number TEXT,
                    hall TEXT,
                    floor INTEGER,
                    isAvailable BOOLEAN)''')

# Create RoomDetails table
cursor.execute('''CREATE TABLE IF NOT EXISTS RoomDetails (
                    room_id INTEGER PRIMARY KEY,
                    occupancy INTEGER,
                    square_footage INTEGER,
                    num_saves INTEGER)''')

# Create RoomSaves table
cursor.execute('''CREATE TABLE IF NOT EXISTS RoomSaves (
                    user_id INTEGER,
                    saved_rooms TEXT)''')

# Populate RoomOverview table with mock data
hall = 'Wendell' # Wendell B specifically; though they are the same hall, they are different floor plans
floor = 3
isAvailable = True
room_numbers = ['B320', 'B318', 'B316', 'B314', 'B312', 'B310', 'B308', 'B317', 'B315', 'B313', 'B311', 'B309']
occupancies = [4, 4, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4]
square_footages = [460, 517, 148, 484, 152, 148, 175, 115, 484, 115, 115, 512]
num_saves = 0
num_rooms = 12


for i in range(num_rooms):  # 12 rooms
    cursor.execute('''INSERT INTO RoomOverview (room_id, room_number, hall, floor, isAvailable)
                      VALUES (?, ?, ?, ?, ?)''', (i + 1, room_numbers[i], hall, floor, isAvailable))

# Populate RoomDetails table with mock data
for i in range(num_rooms):  # 12 rooms
    cursor.execute('''INSERT INTO RoomDetails (room_id, occupancy, square_footage, num_saves)
                      VALUES (?, ?, ?, ?)''', (i + 1, occupancies[i], square_footages[i], num_saves))

# No initial users are added to RoomSaves. The table is ready to accept users later.

# Commit and close the connection
conn.commit()
conn.close()

print("Database setup and initial data population complete.")
