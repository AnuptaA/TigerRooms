#-----------------------------------------------------------------------
# database_setup.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
import pandas as pd
from db_config import DATABASE_URL

def main():
    try:
        # Connect to PostgreSQL database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        print("Connected to the database.")

        # Set lock timeout to prevent long waits for locks
        cursor.execute("SET lock_timeout = '5s';")
        conn.commit()

        # Enable autocommit mode for dropping tables
        conn.autocommit = True
        print("Dropping existing tables if they exist...")

        # List of tables to drop
        tables = [
            "LastTimestamp", 
            "RoomSaves", 
            "RoomDetails", 
            "RoomOverview",
            "GroupMembers", 
            "Groups", 
            "GroupInvites",
            "Users"
        ]
        # Drop each table with autocommit enabled
        for table in tables:
            try:
                cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
                print(f"{table} table dropped successfully.")
            except Exception as e:
                print(f"Error dropping {table} table: {e}")

        # Disable autocommit mode for subsequent transactional control
        conn.autocommit = False

        #-----------------------------------------------------------------------

        # Re-create tables in a single transaction
        try:
            print("Creating tables...")

            # Create RoomOverview table with ResidentialCollege column
            cursor.execute('''
                CREATE TABLE "RoomOverview" (
                    "room_id" SERIAL PRIMARY KEY,
                    "room_number" TEXT,
                    "hall" TEXT,
                    "floor" INTEGER,
                    "isAvailable" BOOLEAN,
                    "residential_college" TEXT
                )
            ''')
            print("RoomOverview table created.")

            # Create RoomDetails table
            cursor.execute('''
                CREATE TABLE "RoomDetails" (
                    "room_id" INTEGER PRIMARY KEY REFERENCES "RoomOverview"("room_id"),
                    "occupancy" INTEGER,
                    "square_footage" INTEGER,
                    "num_saves" INTEGER DEFAULT 0
                )
            ''')
            print("RoomDetails table created.")

            # Create RoomSaves table
            cursor.execute('''
                CREATE TABLE "RoomSaves" (
                    "netid" TEXT,
                    "room_id" INTEGER REFERENCES "RoomOverview"("room_id"),
                    PRIMARY KEY ("netid", "room_id")
                )
            ''')
            print("RoomSaves table created.")

            # # Create RoomReviews table
            # cursor.execute('''
            #     CREATE TABLE "RoomReviews" (
            #         "netid" TEXT,
            #         "room_id" INTEGER REFERENCES "RoomOverview"("room_id"),
            #         "rating" INTEGER CHECK ("rating" BETWEEN 1 AND 5),
            #         "review_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            #         "comments" TEXT,
            #         PRIMARY KEY ("netid", "room_id")
            #     )
            # ''')
            # print("RoomReviews table created.")

            # Create LastTimestamp table
            cursor.execute('''
                CREATE TABLE "LastTimestamp" (
                    "last_timestamp" TEXT PRIMARY KEY
                )
            ''')
            print("LastTimestamp table created.")

            # Create Groups table
            cursor.execute('''
                CREATE TABLE "Groups" (
                    "group_id" SERIAL PRIMARY KEY,
                    "creator_netid" TEXT NOT NULL,
                    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            print("Groups table created.")

            # Create GroupMembers table
            cursor.execute('''
                CREATE TABLE "GroupMembers" (
                    "group_id" INTEGER REFERENCES "Groups"("group_id") ON DELETE CASCADE,
                    "netid" TEXT UNIQUE NOT NULL,
                    PRIMARY KEY ("group_id", "netid")
                )
            ''')
            print("GroupMembers table created.")

            # Create GroupInvites table
            cursor.execute('''
                CREATE TABLE "GroupInvites" (
                    "group_id" INTEGER REFERENCES "Groups"("group_id") ON DELETE CASCADE,
                    "invitee_netid" TEXT NOT NULL,
                    PRIMARY KEY ("group_id", "invitee_netid")
                )
            ''')
            print("GroupInvites table created.")

            # Create Users table
            cursor.execute('''
                CREATE TABLE "Users" (
                    "netid" TEXT PRIMARY KEY,
                    "num_invites" INTEGER DEFAULT 0 CHECK ("num_invites" >= 0)
                )
            ''')
            print("Users table created.")

            conn.commit()  # Commit all create table operations at once
        except Exception as e:
            print(f"Error creating tables: {e}")
            conn.rollback()

        #-----------------------------------------------------------------------

        # Inserting initial 'N/A' timestamp
        print("Inserting initial 'N/A' timestamp...")
        try:
            cursor.execute('''
                INSERT INTO "LastTimestamp" ("last_timestamp") 
                VALUES ('N/A')
                ON CONFLICT ("last_timestamp") DO NOTHING
            ''')
            conn.commit()
            print("Initial 'N/A' timestamp inserted.")
        except Exception as e:
            print(f"Error inserting initial timestamp: {e}")
            conn.rollback()

        #-----------------------------------------------------------------------

        # Room data for different floors, halls, and residential colleges
        room_data = [
            # Wendell B Floors --------------------------------------------------
            {
                "residential_college": "Whitman", "hall": "Wendell-B", "floor": 2,
                "room_numbers": ['B220', 'B218', 'B216', 'B214', 'B212', 'B210', 'B204', 'B215', 'B211', 'B209', 'B205'],
                "occupancies": [4, 4, 1, 4, 1, 1, 1, 4, 2, 4, 1], "square_footages": [458, 514, 149, 480, 152, 147, 139, 484, 212, 480, 113]
            },
            {
                "residential_college": "Whitman", "hall": "Wendell-B", "floor": 3,
                "room_numbers": ['B320', 'B318', 'B316', 'B314', 'B312', 'B310', 'B308', 'B317', 'B315', 'B313', 'B311', 'B309'],
                "occupancies": [4, 4, 1, 4, 1, 1, 1, 1, 4, 1, 1, 4], "square_footages": [460, 517, 148, 484, 152, 148, 175, 115, 484, 115, 115, 512]
            },
            {
                "residential_college": "Whitman", "hall": "Wendell-B", "floor": 4,
                "room_numbers": ['B428', 'B426', 'B424', 'B422', 'B420', 'B418', 'B416', 'B414', 'B412', 'B410', 'B408', 'B421', 'B419', 'B417', 'B415', 'B411', 'B409', 'B407'],
                "occupancies": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1], "square_footages": [130, 150, 150, 131, 134, 140, 134, 137, 131, 133, 167, 195, 152, 153, 201, 208, 152, 206]
            },
            # Wendell C Floors --------------------------------------------------
            {
                "residential_college": "Whitman", "hall": "Wendell-C", "floor": 2, 
                "room_numbers": ['C207', 'C209', 'C211', 'C213', 'C215', 'C217', 'C202', 'C204', 'C206', 'C208', 'C210', 'C212', 'C214', 'C216'],
                "occupancies": [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1], "square_footages": [146, 146, 147, 146, 147, 143, 160, 450, 143, 149, 150, 149, 149, 138]
            },
            {
                "residential_college": "Whitman", "hall": "Wendell-C", "floor": 3, 
                "room_numbers": ['C307', 'C313', 'C317', 'C302', 'C304', 'C306', 'C308', 'C310', 'C312', 'C314', 'C316', 'C322'],
                "occupancies": [1, 4, 2, 1, 4, 1, 1, 1, 1, 1, 1, 1], "square_footages": [146, 623, 255, 145, 450, 146, 148, 149, 148, 148, 136, 210]
            },
            {
                "residential_college": "Whitman", "hall": "Wendell-C", "floor": 4, 
                "room_numbers": ['C409', 'C411', 'C413', 'C415', 'C419', 'C402', 'C404', 'C406', 'C410', 'C412', 'C414', 'C416', 'C418', 'C422'],
                "occupancies": [1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], "square_footages": [129, 144, 149, 132, 213, 376, 134, 127, 148, 149, 148, 148, 136, 172]
            },
            # Fisher Floors --------------------------------------------------
            {
                "residential_college": "Whitman", "hall": "Fisher", "floor": 1, 
                "room_numbers": ['A101', 'A103', 'A105', 'A108', 'A114', 'A116', 'A121'],
                "occupancies": [4, 1, 1, 1, 1, 1, 1], "square_footages": [722, 145, 148, 147, 111, 111, 117]
            },
            {
                "residential_college": "Whitman", "hall": "Fisher", "floor": 2, 
                "room_numbers": ['A201', 'A203', 'A205', 'A206', 'A208', 'A210', 'A212', 'A221', 'A223', 'A224', 'A225'],
                "occupancies": [4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4], "square_footages": [755, 145, 145, 145 ,143, 146, 143, 116, 134, 174, 687]
            },
            {
                "residential_college": "Whitman", "hall": "Fisher", "floor": 3, 
                "room_numbers": ['A301', 'A302', 'A303', 'A305', 'A308', 'A310', 'A312', 'A314', 'A316', 'A317', 'A318', 'A321', 'A323'],
                "occupancies": [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4], "square_footages": [245, 126, 233, 139, 131, 133, 129, 135, 129, 135, 129, 113, 132, 120, 1065]
            },
            # 1981 Floors --------------------------------------------------
            {
                "residential_college": "Whitman", "hall": "1981", "floor": 0, 
                "room_numbers": ['F007', 'F015', 'F016', 'F017', 'F018', 'F019', 'F023', 'F024', 'F025', 'F026', 'F027'],
                "occupancies": [1, 1, 1, 1, 4, 2, 1, 1, 1, 1, 1], "square_footages": [107, 144, 118, 150, 466, 232, 147, 115, 147, 139, 164]
            }, 
            {
                "residential_college": "Whitman", "hall": "1981", "floor": 1, 
                "room_numbers": ['F101', 'F102', 'F103', 'F104', 'F105', 'F107', 'F113', 'F114', 'F116', 'F117', 'F121', 'F123'],
                "occupancies": [1, 1, 4, 1, 4, 1, 4, 1, 4, 4, 1, 4], "square_footages": [149, 159, 484, 170, 475, 131, 465, 101, 465, 466, 147, 702]
            },
            {
                "residential_college": "Whitman", "hall": "1981", "floor": 2, 
                "room_numbers": ['F201', 'F203', 'F205', 'F207', 'F212', 'F214', 'F216', 'F217', 'F218', 'F225', 'F226', 'F227', 'F228', 'F229'],
                "occupancies": [4, 2, 1, 1, 1, 4, 1, 4, 1, 1, 1, 1, 1, 4], "square_footages": [1115, 235, 115, 108, 119, 526, 118, 465, 118, 147, 114, 147, 117, 706]
            },
            {
                "residential_college": "Whitman", "hall": "1981", "floor": 3, 
                "room_numbers": ['F301', 'F302', 'F303', 'F305', 'F307' ,'F314', 'F315', 'F316', 'F318', 'F319', 'F326', 'F327', 'F328'],
                "occupancies": [4, 2, 1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1], "square_footages": [1020, 288, 177, 115, 108, 526, 465, 118, 118, 151, 115, 148, 117]
            },
            {
                "residential_college": "Whitman", "hall": "1981", "floor": 4, 
                "room_numbers": ['F407', 'F409', 'F410', 'F411', 'F412', 'F414', 'F415', 'F417', 'F420'],
                "occupancies": [1, 1, 1, 1, 1, 1, 1, 1, 4], "square_footages": [136, 145, 185, 146, 155, 162, 146, 146, 634]
            },
            # Lauritzen Floors --------------------------------------------------
            {
                "residential_college": "Whitman", "hall": "Lauritzen", "floor": 0, 
                "room_numbers": ['D002', 'D003', 'D004', 'D006', 'D008', 'D010', 'D012', 'D014', 'D016', 'D018', 'D020'],
                "occupancies": [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2], "square_footages": [160, 160, 160, 160, 160, 160, 160, 160, 190, 194, 187]
            },
            {
                "residential_college": "Whitman", "hall": "Lauritzen", "floor": 1, 
                "room_numbers": ['D105', 'D106', 'D107', 'D108', 'D109', 'D110', 'D112', 'D114'],
                "occupancies": [4, 1, 4, 1, 1, 1, 4, 4], "square_footages": [496, 144, 529, 148, 117, 148, 460, 593]
            },
            {
                "residential_college": "Whitman", "hall": "Lauritzen", "floor": 2, 
                "room_numbers": ['D201', 'D203', 'D205', 'D206', 'D207', 'D209', 'D212', 'D214'],
                "occupancies": [1, 1, 4, 1, 4, 1, 4, 4], "square_footages": [125, 118, 496, 144, 529, 118, 463, 595]
            },
            {
                "residential_college": "Whitman", "hall": "Lauritzen", "floor": 3, 
                "room_numbers": ['D301', 'D302', 'D303', 'D304', 'D305', 'D306', 'D307', 'D308', 'D311', 'D312', 'D314'],
                "occupancies": [1, 1, 1, 1, 4, 1, 4, 1, 1, 1, 4], "square_footages": [131, 146, 117, 176, 495, 169, 500, 146, 117, 152, 965]
            },
            {
                "residential_college": "Whitman", "hall": "Lauritzen", "floor": 4, 
                "room_numbers": ['D403', 'D404', 'D405', 'D406', 'D407', 'D408', 'D409', 'D410', 'D412', 'D413', 'D414', 'D416', 'D418', 'D420'],
                "occupancies": [1, 1, 1, 1, 2,1, 2, 1, 1, 2, 1, 1, 1, 1], "square_footages": [149, 132, 149, 131, 291, 149, 229, 139, 132, 203, 132, 133, 139, 132]
            },
            # Murley-Pivirotto Floors --------------------------------------------------
            {
                "residential_college": "Whitman", "hall": "Murley-Pivirotto", "floor": 3, 
                "room_numbers": ['T302', 'T304'],
                "occupancies": [2, 2], "square_footages": [240, 231]
            },
            {
                "residential_college": "Whitman", "hall": "Murley-Pivirotto", "floor": 4, 
                "room_numbers": ['T402', 'T403'],
                "occupancies": [4, 2], "square_footages": [965, 584]
            },
            # Baker-E Floors --------------------------------------------------
            {
                "residential_college": "Whitman", "hall": "Baker-E", "floor": 0, 
                "room_numbers": ['E002', 'E006', 'E008', 'E010', 'E012', 'E014', 'E016', 'E018', 'E024'],
                "occupancies": [2, 2, 2, 2, 2, 2, 2, 2], "square_footages": [201, 142, 141, 141, 141, 141, 141, 141, 141]
            },
            {
                "residential_college": "Whitman", "hall": "Baker-E", "floor": 1, 
                "room_numbers": ['E105', 'E107', 'E108', 'E109', 'E113', 'E118', 'E120', 'E121', 'E123','E125'],
                "occupancies": [1, 1, 1, 1, 1, 1, 1, 4, 1, 1], "square_footages": [116, 114, 144, 144, 220, 146, 146, 450, 140, 140]
            },
            {
                "residential_college": "Whitman", "hall": "Baker-E", "floor": 2, 
                "room_numbers": ['E205', 'E206', 'E207', 'E208', 'E210', 'E211', 'E214', 'E215', 'E217', 'E218', 'E219', 'E221', 'E223', 'E224'],
                "occupancies": [1, 1, 1, 1, 1, 4, 1, 1, 1, 4, 4, 1, 1, 1], "square_footages": [111, 215, 114, 220, 145, 486, 118, 109, 114, 470, 452, 145, 140, 113]
            },
            # for floor 3, there are 5 of what singles that don't have square footages on tigerdraw, so I guestimated a
            # square footage of 113 for now based off of E310
            # the 5 singles are (E311, E313, E314, E315, E317)
            {
                "residential_college": "Whitman", "hall": "Baker-E", "floor": 3, 
                "room_numbers": ['E305', 'E306', 'E307', 'E308', 'E309', 'E310', 'E311', 'E313', 'E314', 'E315', 'E317', 'E319', 'E321', 'E323'],
                "occupancies": [1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1], "square_footages": [114, 465, 114, 144, 146, 113, 113, 113, 113, 113, 113, 458, 145, 135]
            },
            {
                "residential_college": "Whitman", "hall": "Baker-E", "floor": 4, 
                "room_numbers": ['E404', 'E405', 'E406', 'E407', 'E408', 'E409', 'E410', 'E411', 'E413', 'E415', 'E416', 'E417', 'E418', 'E419', 'E421', 'E423', 'E425', 'E427', 'E429'],
                "occupancies": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], "square_footages": [135, 126, 121, 126, 149, 126, 128, 124, 133, 128, 128, 133, 128, 138, 128, 133, 141, 137, 130, 119]
            },
            # Baker-S Floors --------------------------------------------------
            {
                "residential_college": "Whitman", "hall": "Baker-S", "floor": 0, 
                "room_numbers": ['S002', 'S003'],
                "occupancies": [4, 2], "square_footages": [650, 261]
            },
            {
                "residential_college": "Whitman", "hall": "Baker-S", "floor": 1, 
                "room_numbers": ['S102', 'S104', 'S106'],
                "occupancies": [4, 1, 1], "square_footages": [554, 200, 138]
            },
            {
                "residential_college": "Whitman", "hall": "Baker-S", "floor": 2, 
                "room_numbers": ['S202', 'S203', 'S204', 'S205', 'S206'],
                "occupancies": [4, 1, 1, 1, 1], "square_footages": [558, 193, 202, 195, 1378]
            },
            {
                "residential_college": "Whitman", "hall": "Baker-S", "floor": 3, 
                "room_numbers": ['S302', 'S303', 'S305'],
                "occupancies": [4, 1, 1], "square_footages": [510, 179, 211]
            },
            {
                "residential_college": "Whitman", "hall": "Baker-S", "floor": 4, 
                "room_numbers": ['S402', 'S403', 'S404', 'S405', 'S406'],
                "occupancies": [4, 1, 1, 1, 1], "square_footages": [485, 128, 109, 131, 109]
            },
            # Hargadon Floors --------------------------------------------------
            {
                "residential_college": "Whitman", "hall": "Hargadon", "floor": 2, 
                "room_numbers": ['G203A', 'G203B', 'G205', 'G207'],
                "occupancies": [1, 1, 1, 1], "square_footages": [157, 220, 156, 155]
            },
            {
                "residential_college": "Whitman", "hall": "Hargadon", "floor": 3, 
                "room_numbers": ['G301', 'G304A', 'G304B', 'G306', 'G309', 'G311'],
                "occupancies": [1, 1, 1, 1, 1, 1], "square_footages": [173, 157, 220, 156, 188, 188]
            },
            {
                "residential_college": "Whitman", "hall": "Hargadon", "floor": 4, 
                "room_numbers": ['G401', 'G402', 'G403', 'G404', 'G405', 'G406', 'G407A', 'G407B'],
                "occupancies": [1, 1, 1, 1, 1, 1, 1, 1], "square_footages": [181, 128, 185, 189, 165, 140, 150, 110]
            }
        ]

        # Overrides room data to populate database from excel file rather than hard-coding
        room_data = []
        df = pd.read_excel('Whitman_data.xlsx')
        grouped = df.groupby(['hall', 'floor'])
        for (hall, floor), group in grouped:
            group_dict = {
                'residential_college': 'Whitman',
                "hall": hall,
                "floor": int(floor),  # Convert floor to native Python int
                "room_numbers": group['room_number'].tolist(),
                "occupancies": [int(o) for o in group['occupancy']],  # Convert occupancies to native Python int
                "square_footages": [float(sf) for sf in group['square_footage']]  # Convert square footage to Python float
            }
            room_data.append(group_dict)
        
        #-----------------------------------------------------------------------
    
        # Populate tables with room data
        for data in room_data:
            residential_college = data["residential_college"]
            hall = data["hall"]
            floor = data["floor"]
            room_numbers = data["room_numbers"]
            occupancies = data["occupancies"]
            square_footages = data["square_footages"]

            for i in range(len(room_numbers)):
                # Insert room into RoomOverview with the appropriate residential_college
                cursor.execute(
                    '''
                    INSERT INTO "RoomOverview" ("room_number", "hall", "floor", "isAvailable", "residential_college")
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING "room_id"
                    ''',
                    (room_numbers[i], hall, floor, True, residential_college)
                )
                room_id = cursor.fetchone()[0]
                cursor.execute(
                    '''
                    INSERT INTO "RoomDetails" ("room_id", "occupancy", "square_footage", "num_saves")
                    VALUES (%s, %s, %s, %s)
                    ''',
                    (room_id, occupancies[i], square_footages[i], 0)
                )
            conn.commit()
            print(f"RoomOverview and RoomDetails tables populated for {hall} Hall, Floor {floor}, College {residential_college}.")

        #-----------------------------------------------------------------------

        print("Database setup and initial data population complete.")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        # Close the cursor and connection to release locks and end transactions
        cursor.close()
        conn.close()
        print("Database connection closed.")

# Run the script
if __name__ == "__main__":
    main()
