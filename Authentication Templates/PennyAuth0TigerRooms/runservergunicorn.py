#!/usr/bin/env python

#-----------------------------------------------------------------------
# runservergunicorn.py
# Author: Bob Dondero
#-----------------------------------------------------------------------

import sys
import os

PORT = 3000

def main():

    if len(sys.argv) != 1:
        print('Usage: ' + sys.argv[0], file=sys.stderr)
        sys.exit(1)

    os.system('gunicorn -b 0.0.0.0:' + PORT +
        ' --access-logfile - penny:app')

if __name__ == '__main__':
    main()
