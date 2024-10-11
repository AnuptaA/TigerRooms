#!/usr/bin/env python

#-----------------------------------------------------------------------
# runserver.py
# Author: Bob Dondero
#-----------------------------------------------------------------------

import sys
import penny

PORT = 3000

def main():

    if len(sys.argv) != 1:
        print('Usage: ' + sys.argv[0], file=sys.stderr)
        sys.exit(1)

    try:
        penny.app.run(host='0.0.0.0', port=PORT, debug=True)
    except Exception as ex:
        print(ex, file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
