#-----------------------------------------------------------------------
import pandas as pd
from datetime import datetime, timedelta
import random
from openpyxl import load_workbook
from xlsx2html import xlsx2html
import pdfkit

#-----------------------------------------------------------------------
# returns a datetime object that is 30 minutes later
def add_30_min(timestamp):
    return timestamp + timedelta(minutes=30)

# standardizes the dataframe to the format that we want
def standardize_df(df):
    df.rename(columns={'residential_college': 'College', 'hall': 'Building', 'room_number': 'Room', 'occupancy': 'Type', 'square_footage': 'Sq. Ft.'}, inplace=True)
    df.drop(columns=['num_bedrooms', 'has_common_room', 'floor'], inplace=True)
    return df

occupancy_to_type = {
    1: 'SINGLE',
    2: 'DOUBLE',
    3: 'TRIPLE',
    4: 'QUAD'
}
    
#-----------------------------------------------------------------------

def generate_room_draw_files(min_people_in_group, max_people_in_group, starting_excel, process_num):
    df = pd.read_excel(starting_excel)
    df = standardize_df(df)
    print(df.columns)

    timestamp = datetime(2004, 10, 24, 8, 0)
    pdf_counter = 0
    validRemoval = False

    # create new pdfs while there are still rooms left
    while len(df) > 0:
        pdf_counter += 1
        while not validRemoval:
            num_rooms_to_remove = min(random.randint(10, max_people_in_group), len(df))
            print(f"Removing {num_rooms_to_remove}")
            
            df_removal = df.sample(n=num_rooms_to_remove)
            total_occupancy = df_removal['Type'].sum()
            if total_occupancy > max_people_in_group or total_occupancy < min_people_in_group:
                validRemoval = False
            else:
                validRemoval = True

        df = df.drop(df_removal.index)
        print(df_removal)
        print()
        
        #save to excel file
        if len(df) > 0:
            # clean columns before 
            df_copy = df.copy()

            df_copy['Type'] = df_copy['Type'].map(occupancy_to_type)
            df_copy['College'] = 'Whitman College'
            print(type(df_copy.iloc[0]['Sq. Ft.']))

            excel_file_name = f"RoomDraw_Process{process_num}_pdf{pdf_counter}.xlsx"
            df_copy.to_excel(excel_file_name, index=False)

            # add timestamp as header to excel file
            add_timestamp_as_header(timestamp, excel_file_name)

            # convert to pdf
            



        validRemoval = False
        timestamp = add_30_min(timestamp)



def add_timestamp_as_header(timestamp, file_name):
    workbook = load_workbook(file_name)
    sheet = workbook.active
    timestamp_header = timestamp.strftime("Updated %m/%d/%Y %I:%M %p")

    sheet.insert_rows(1)  # Insert a blank row at the top
    sheet["B1"] = timestamp_header  # Add the timestamp to the second cell
    workbook.save(file_name)
#-----------------------------------------------------------------------
def main():
    input_file = 'Whitman_data.xlsx'
    Process_number = 2
    min = 1
    max = 40
    generate_room_draw_files(min, max, input_file, Process_number)
#-----------------------------------------------------------------------
if __name__ == '__main__':
    main()
        
