#!/usr/bin/env python

#-----------------------------------------------------------------------
# pdfgenerator.py
# Author: TigerRooms Team
#-----------------------------------------------------------------------

import sys
import argparse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors

#-----------------------------------------------------------------------

# Sample room data

data = [
    ["College", "Building", "Room", "Type", "Sq. Ft."],
    ["Butler College", "1976", "D106", "QUAD", "538"],
    ["Butler College", "BOGLE", "C204", "QUAD", "522"],
    ["Butler College", "WILF", "E301", "SINGLE", "137"],
]

#-----------------------------------------------------------------------

def create_pdf(filename):
    pdf = SimpleDocTemplate(filename, pagesize=letter)
    elements = []

    # Create a table with the data
    table = Table(data)
    
    # Styling the table
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.black), # Header background
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white), # Header text color
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.grey), # Rows background
        ('GRID', (0, 0), (-1, -1), 1, colors.black), # Grid lines
    ])
    table.setStyle(style)

    # Add table to the PDF elements
    elements.append(table)

    # Build PDF
    pdf.build(elements)

#-----------------------------------------------------------------------
    
def main():
    descript = "PDF Generator application: convert pandas DF into PDF"
    parser = argparse.ArgumentParser(prog=f'{sys.argv[0]}',
                                     description=descript)
    parser.add_argument("filename", type=str, metavar="filename",
                        help="the name of the generated PDF file")
    
    # Get filename
    args = vars(parser.parse_args())
    filename = args.get("filename") + ".pdf"

    create_pdf(filename)

#-----------------------------------------------------------------------
if __name__  == '__main__':
    main()