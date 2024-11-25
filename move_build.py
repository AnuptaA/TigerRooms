#-----------------------------------------------------------------------
# move_build.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import os
import shutil

#-----------------------------------------------------------------------

def main():
    # Get current working directory
    root_dir = os.getcwd()

    # Define the source and destination paths
    source_dir = os.path.join(root_dir, 'react', 'build')
    destination_dir = os.path.join(root_dir, 'server', 'build')

    # Move the build folder
    try:
        shutil.move(source_dir, destination_dir)
        print(f"Successfully moved '{source_dir}' to '{destination_dir}'")
    except Exception as e:
        print(f"Error occurred: {e}")

#-----------------------------------------------------------------------

if __name__ == '__main__':
    main()

