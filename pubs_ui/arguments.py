'''
Created on Oct 24, 2014

@author: ayan
'''

from webargs import Arg


#search args, will be used for the search params and generating the opensearch.xml documentation
search_args = {
               'q': Arg(str, multiple=True),
               'title': Arg(str, multiple=True),
               'author': Arg(str, multiple=True),
               'year': Arg(str, multiple=True),
               'abstract': Arg(str, multiple=True)
               }
