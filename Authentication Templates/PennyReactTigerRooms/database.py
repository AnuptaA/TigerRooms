#!/usr/bin/env python

#-----------------------------------------------------------------------
# database.py
# Author: Bob Dondero
#-----------------------------------------------------------------------

import sqlite3
import contextlib

#-----------------------------------------------------------------------

_DATABASE_URL = 'file:penny.sqlite?mode=ro'

#-----------------------------------------------------------------------

def get_books(author):

    books = []

    with sqlite3.connect(_DATABASE_URL, isolation_level=None,
        uri=True) as connection:

        with contextlib.closing(connection.cursor()) as cursor:

            query_str = "SELECT isbn, author, title FROM books "
            query_str += "WHERE author LIKE ?"
            cursor.execute(query_str, [author+'%'])

            table = cursor.fetchall()
            for row in table:
                book = {'isbn': row[0], 'author': row[1],
                    'title': row[2]}
                books.append(book)

    return books

#-----------------------------------------------------------------------

def _test():

    books = get_books('ker')
    for book in books:
        print(book['isbn'])
        print(book['author'])
        print(book['title'])
        print()

if __name__ == '__main__':
    _test()
