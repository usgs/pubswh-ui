'''
Created on Oct 24, 2014

@author: ayan
'''

from webargs import Arg


#search args, will be used for the search params and generating the opensearch.xml documentation
search_args = {
                "q": Arg(str, multiple=True),
                "title": Arg(str, multiple=True),
                "abstract": Arg(str, multiple=True),
                "contributor": Arg(str, multiple=True),
                "prodId": Arg(str, multiple=True),
                "indexId": Arg(str, multiple=True),
                "ipdsId": Arg(str, multiple=True),
                "year": Arg(str, multiple=True),
                "startYear": Arg(str, multiple=True),
                "endYear": Arg(str, multiple=True),
                "contributingOffice": Arg(str, multiple=True),
                "typeName": Arg(str, multiple=True),
                "subtypeName": Arg(str, multiple=True),
                "seriesName": Arg(str, multiple=True),
                "reportNumber": Arg(str, multiple=True),
                "page_row_start": Arg(str, multiple=False),
                "page_number" : Arg(str, multiple=False),
                "page_size": Arg(str, multiple=False),
                "pub_x_days": Arg(str, multiple=False),
                "pub_date_low": Arg(str, multiple=False),
                "pub_date_high": Arg(str, multiple=False),
                "mod_x_days": Arg(str, multiple=False),
                "mod_date_low": Arg(str, multiple=False),
                "mod_date_high": Arg(str, multiple=False),
                "orderBy": Arg(str, multiple=False)
               }
