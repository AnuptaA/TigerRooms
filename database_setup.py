import psycopg2
from db_config import DATABASE_URL

# Connect to PostgreSQL database
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

# Drop existing tables in reverse order with CASCADE to handle dependencies
cursor.execute('DROP TABLE IF EXISTS RoomSaves CASCADE')
cursor.execute('DROP TABLE IF EXISTS RoomDetails CASCADE')
cursor.execute('DROP TABLE IF EXISTS RoomOverview CASCADE')

# Create tables
cursor.execute('''
    CREATE TABLE RoomOverview (
        room_id SERIAL PRIMARY KEY,
        room_number TEXT,
        hall TEXT,
        floor INTEGER,
        isAvailable BOOLEAN
    )
''')

cursor.execute('''
    CREATE TABLE RoomDetails (
        room_id INTEGER PRIMARY KEY REFERENCES RoomOverview(room_id),
        occupancy INTEGER,
        square_footage INTEGER,
        num_saves INTEGER DEFAULT 0
    )
''')

cursor.execute('''
    CREATE TABLE RoomSaves (
        netid TEXT,
        room_id INTEGER REFERENCES RoomOverview(room_id),
        PRIMARY KEY (netid, room_id)
    )
''')

# Populate RoomOverview table with mock data
hall = 'Wendell'  # Wendell B specifically
floor = 3
isAvailable = True
room_numbers = ['B320', 'B318', 'B316', 'B314', 'B312', 'B310', 'B308', 'B317', 'B315', 'B313', 'B311', 'B309']
occupancies = [4, 4, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4]
square_footages = [460, 517, 148, 484, 152, 148, 175, 115, 484, 115, 115, 512]

for i in range(len(room_numbers)):
    cursor.execute(
        '''
        INSERT INTO RoomOverview (room_number, hall, floor, isAvailable)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (room_id) DO NOTHING
        ''',
        (room_numbers[i], hall, floor, isAvailable)
    )

for i in range(len(room_numbers)):
    cursor.execute(
        '''
        INSERT INTO RoomDetails (room_id, occupancy, square_footage, num_saves)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (room_id) DO NOTHING
        ''',
        (i + 1, occupancies[i], square_footages[i], 0)
    )

# Commit and close the connection
conn.commit()
conn.close()
print("Database setup and initial data population complete.")
