#!/usr/bin/env python

#-----------------------------------------------------------------------
# pdfparser.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import sys
import pandas as pd
import argparse
import tabula

#-----------------------------------------------------------------------

def parse_pdf(filepath):
    # parse pdf into a list of dataframes
    tables_list = tabula.read_pdf(filepath, 
                                  multiple_tables=True, 
                                  pages='all',
                                  pandas_options={'header': None})
    
    # get update time
    first_page = tables_list[0]
    first_row = first_page.iloc[0]
    last_updated = first_row[0]

    # drop first two rows, concatenate with remaining tables
    first_page_dropped = first_page[2:].reset_index(drop=True)
    rem_pages = tables_list[1:]

    concatenated_tables = pd.concat([first_page_dropped] + rem_pages, 
                                     ignore_index=True)
    
    # drop NaN rows
    processed_table = concatenated_tables.dropna(how='all')

    # ensure all square footage values are integers
    processed_table.loc[:, 4] = processed_table[4].astype(int)

    return last_updated, processed_table

#-----------------------------------------------------------------------

def main():
    # Create argument parser
    descript = "PDF Parser application: convert PDF into pandas DF"
    parser = argparse.ArgumentParser(prog=f'{sys.argv[0]}',
                                     description=descript)
    parser.add_argument("filepath", type=str, metavar="filepath",
                        help="the string path to the PDF file")
    
    # Get filepath
    args = vars(parser.parse_args())
    filepath = args.get("filepath")

    last_updated, tables = parse_pdf(filepath)
    print(last_updated)
    print(tables.to_string())

#-----------------------------------------------------------------------
if __name__ == '__main__':
    main()