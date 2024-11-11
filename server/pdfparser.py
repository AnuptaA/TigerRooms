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
