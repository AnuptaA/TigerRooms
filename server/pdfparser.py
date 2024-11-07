#!/usr/bin/env python

#-----------------------------------------------------------------------
# pdfparser.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import sys
import pandas as pd
import argparse
import tabula
import re

#-----------------------------------------------------------------------

def parse_pdf(filepath):
    # Parse tables found in PDF into a list of dataframes
    tables_list = tabula.read_pdf(filepath, 
                                  multiple_tables=True, 
                                  pages='all',
                                  pandas_options={'header': None})
    
    if not tables_list:
        raise ValueError("No tables found in the PDF.")
    
    # Check for timestamp in format "Updated MM/DD/YYYY HH:MM AM/PM"
    last_updated = None
    updated_time_pattern = r'Updated\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s*(\d{1,2}:\d{2})\s*(AM|PM|am|pm)'
    
    # Search for the timestamp across all tables
    for table in tables_list:
        for row in table.values.flatten():
            if isinstance(row, str):
                match = re.search(updated_time_pattern, row)
                # If the timestamp entry is found, save it
                if match:
                    last_updated = f"{match.group(1)} {match.group(2)} {match.group(3)}"
                    break

        if last_updated:
            break
    
    # If no last updated timestamp is found, raise error
    if not last_updated:
        raise ValueError("Last updated timestamp not found in the document.")
    
    # Check for header columns of this form
    required_columns = ['college', 'building', 'room', 'type', 'sq. ft.']
    header_row_idx = None

    for table in tables_list:
        for row_idx, row in table.iterrows():
            row_lower = row.astype(str).str.lower().values
            if all(col in row_lower for col in required_columns):
                header_row_idx = row_idx
                break
        if header_row_idx is not None:
            break
    
    # If no header row is found, throw an error
    if header_row_idx is None:
        raise ValueError("Header row not found.")

    # Drop all rows before the header row, resetting the index
    # It can be assumed that the header row will be in the first table
    first_page = tables_list[0]
    first_page_after_header = first_page.iloc[header_row_idx + 1:].reset_index(drop=True)

    # Concatenate this modified table with remaining tables
    rem_pages = tables_list[1:]
    concatenated_tables = pd.concat([first_page_after_header] + rem_pages, ignore_index=True)
    
    # Drop NaN rows (rows with no data)
    processed_table = concatenated_tables.dropna(how='all')

    # Ensure the square footage column is numeric
    # It can be assumed that this is the last column
    processed_table.iloc[:, -1] = pd.to_numeric(processed_table.iloc[:, -1], errors='coerce').fillna(0).astype(int)

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
