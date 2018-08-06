#!/usr/bin/env python
import os
import shutil
import sys

with os.fdopen(sys.stdin.fileno(), 'rb') as input_file,\
     open(sys.argv[1], 'wb') as output_file:
    shutil.copyfileobj(input_file, output_file)
