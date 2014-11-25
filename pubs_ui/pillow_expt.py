'''
Created on Nov 17, 2014

@author: ayan
'''
import os, sys
from PIL import Image


infile = 'C:/Users/ayan/Downloads/PNG_transparency_demonstration_1.png'
filename_split = os.path.splitext(infile)
outfile = '{0}.{1}'.format(filename_split[0], '.jpg')
if infile != outfile:
    try:
        Image.open(infile).save(outfile)
    except IOError:
        print("Cannot Convert")
