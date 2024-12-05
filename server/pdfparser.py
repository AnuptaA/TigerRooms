#!/usr/bin/env python

#-----------------------------------------------------------------------
# pdfparser.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import sys
import pandas as pd
import argparse
import pdfplumber
import tabula
import re

#-----------------------------------------------------------------------
# Function to ensure that returned tables are valid
def validate_tables(tables):
    # checks that the number of columns is correct
    if len(tables.columns) != 5:
        raise ValueError("Number of columns is not 5")

    valid_rescos = ['Upperclass ' 'Butler College ' 'Whitman College ' 'Forbes College '
    'New College West ' 'Mathey College ' 'New College East '
    'Rockefeller College ']
    
    valid_halls = ['1901' '1903' '1967' '1976' '1981' '99ALEXANDER' 'Addy Hall'
    'Aliya Kanji Hall' 'BAKER' 'BLAIR' 'BLOOMBERG' 'BOGLE' 'Bosque Hall'
    'BROWN' 'BUYERS' 'CAMPBELL' 'CUYLER' 'DOD' 'EDWARDS' 'FEINBERG' 'FISHER'
    'FORBES' 'FOULKE' 'Grousbeck Hall' 'H Hall' 'HAMILTON' 'HARGADON' 'HENRY'
    'HOLDER' 'JOLINE' 'Jose Enrique Feliciano Hall'
    'Kwanza Marion Jones Hall' 'LAUGHLIN' 'LAURITZEN' 'LITTLE' 'LOCKHART'
    'Mannion Hall' 'MURLEY' 'PATTON' 'PYNE' 'SCULLY' 'SPELMAN' 'WALKER'
    'WENDELL' 'WILF' 'WITHERSPOON' 'WRIGHT' 'YOSELOFF']

    valid_occupancy = ['TRIPLE' 'DOUBLE' 'SINGLE' 'QUAD' 'DA' 'QUINT' '6PERSON']

    # check that all other columns are correct
    resco_list = tables[0].tolist()
    hall_list = tables[1].tolist()
    occupancy_list = tables[3].tolist()
    sqft_list = tables[4].tolist()

    for value in resco_list:
        if value not in valid_rescos:
            raise ValueError(f"Invalid residential college: {value}")

    # Check hall_list
    for value in hall_list:
        if value not in valid_halls:
            raise ValueError(f"Invalid hall: {value}")

    # Check occupancy_list
    for value in occupancy_list:
        if value not in valid_occupancy:
            raise ValueError(f"Invalid occupancy: {value}")
    
    # check that value in sqft is an integer and is a small enough integer
    for value in sqft_list:
        if not value.isdigit():  # Check if the string contains only digits
            raise ValueError(f"{value} is invalid. Square footage must be an integer.")
        if len(value) > 4:
            raise ValueError(f"Square footage of {value} exceeds the maxmimum")
      
#-----------------------------------------------------------------------

def parse_pdf(filepath):
    # Open the PDF file using pdfplumber
    with pdfplumber.open(filepath) as pdf:
        # Extract tables from all pages
        tables_list = [page.extract_table() for page in pdf.pages if page.extract_table() is not None]
    
    if not tables_list:
        raise ValueError("No tables found in the PDF.")
    
    # Check for timestamp in format "Updated MM/DD/YYYY HH:MM AM/PM"
    last_updated = None
    updated_time_pattern = r'Updated\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(\d{1,2}:\d{2})\s*(AM|PM|am|pm)'
    
    # Search for the timestamp across all tables
    for table in tables_list:
        for row in table:
            if isinstance(row, list):
                for cell in row:
                    if isinstance(cell, str):
                        match = re.search(updated_time_pattern, cell)
                        if match:
                            last_updated = f"{match.group(1)} {match.group(2)} {match.group(3)}"
                            break
            if last_updated:
                break
        if last_updated:
            break
    
    # If no last updated timestamp is found, raise error
    if not last_updated:
        raise ValueError("Last updated timestamp not found in the document.")
    
    # Check for header columns of this form
    required_columns = ['college', 'building', 'room', 'type', 'sq. ft.']
    header_row_idx = None

    # Search for the header row
    for table in tables_list:
        for row_idx, row in enumerate(table):
            row_lower = [str(cell).lower() for cell in row]
            if all(col in row_lower for col in required_columns):
                header_row_idx = row_idx
                break
        if header_row_idx is not None:
            break
    
    # If no header row is found, throw an error
    if header_row_idx is None:
        raise ValueError("Header row not found.")

    # Drop the header row itself (it should not be included in the data)
    # First, use the row after the header as the column names
    first_page = pd.DataFrame(tables_list[0][header_row_idx + 1:])  # No columns specified, let pandas auto number the columns
    
    # Concatenate this modified table with remaining tables, skipping the header row for each
    rem_pages = []
    for table in tables_list[1:]:
        # Skip the header row for subsequent pages
        rem_pages.append(pd.DataFrame(table[header_row_idx + 1:]))  # No columns specified, let pandas auto number the columns

    concatenated_tables = pd.concat([first_page] + rem_pages, ignore_index=True)
    
    # Drop NaN rows
    processed_table = concatenated_tables.dropna(how='all')

    # Ensure the square footage column is numeric
    processed_table.iloc[:, -1] = pd.to_numeric(processed_table.iloc[:, -1], errors='coerce').fillna(0).astype(int)
    #---------------------------------------------
    
    # before we return the tables, we want to make sure that they are in a valid format
    validate_tables(processed_table)


    return last_updated, processed_table

#-----------------------------------------------------------------------

def main():
    # Create argument parser
    descript = "PDF Parser application: convert PDF into pandas DF"
    parser = argparse.ArgumentParser(prog=f'{sys.argv[0]}',
                                     description=descript)
    parser.add_argument("filepath", type=str, metavar="filepath",
                        help="the string path to the PDF file")
    
    # Get filepath from arguments
    args = parser.parse_args()
    filepath = args.filepath

    try:
        # Parse the PDF
        last_updated, tables = parse_pdf(filepath)
        
        # Output the last updated time and the parsed data
        print(f"Timestamp: {last_updated}")
        print(tables.to_string(index=False))
    except Exception as e:
        # Handle exceptions gracefully
        print(f"Error: {e}")
        sys.exit(1)

#-----------------------------------------------------------------------
if __name__ == '__main__':
    main()
