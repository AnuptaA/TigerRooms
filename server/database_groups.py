#-----------------------------------------------------------------------
# database_groups.py
# Authors: TigerRooms Team
#-----------------------------------------------------------------------

import psycopg2
from db_config import DATABASE_URL
from psycopg2.extras import DictCursor

#-----------------------------------------------------------------------

def get_groups_and_members():
    """
    Fetch all groups and their corresponding members from the database.

    Args:
        None

    Returns:
        A dictionary where the keys are group IDs and the values are lists of member net IDs.
    """
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor(cursor_factory=DictCursor) as cursor:
                cursor.execute(
                    '''
                    SELECT g.group_id, gm.netid
                    FROM "Groups" g
                    LEFT JOIN "GroupMembers" gm ON g.group_id = gm.group_id
                    ORDER BY g.group_id, gm.netid;
                    '''
                )

                # Fetch the result
                result = cursor.fetchall()
                print(f"Query Result: ", result)

                # Organize results into a dictionary
                groups_and_members = {}
                for row in result:
                    group_id = int(row["group_id"])
                    netid = row["netid"]

                    if group_id not in groups_and_members:
                        groups_and_members[group_id] = []
                    
                    if netid:
                        groups_and_members[group_id].append(netid)
                
                print(f"Groups and members: {groups_and_members}")
                return {"success": True, "all_groups": groups_and_members}

    except Exception as ex:
        message = f"Error occurred while fetching all groups: {ex}"
        print(message)
        return {"success": False, "error": message}