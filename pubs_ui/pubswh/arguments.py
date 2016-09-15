'''
Created on Oct 24, 2014

@author: ayan
'''

from webargs import fields


#search fields, will be used for the search params and generating the opensearch.xml documentation
search_args = {
                "q": fields.Str(multiple=True),
                "title": fields.Str(multiple=True),
                "abstract": fields.Str(multiple=True),
                "contributor": fields.Str(multiple=True),
                "prodId": fields.Str(multiple=True),
                "indexId": fields.Str(multiple=True),
                "ipdsId": fields.Str(multiple=True),
                "year": fields.Str(multiple=True),
                "startYear": fields.Str(multiple=True),
                "endYear": fields.Str(multiple=True),
                "contributingOffice": fields.Str(multiple=True),
                "typeName": fields.Str(multiple=True),
                "subtypeName": fields.Str(multiple=True),
                "seriesName": fields.Str(multiple=True),
                "reportNumber": fields.Str(multiple=True),
                "page_row_start": fields.Str(multiple=False),
                "page_number" : fields.Str(multiple=False),
                "page_size": fields.Str(multiple=False),
                "pub_x_days": fields.Str(multiple=False),
                "pub_date_low": fields.Str(multiple=False),
                "pub_date_high": fields.Str(multiple=False),
                "mod_x_days": fields.Str(multiple=False),
                "mod_date_low": fields.Str(multiple=False),
                "mod_date_high": fields.Str(multiple=False),
                "orderBy": fields.Str(multiple=False),
                "page": fields.Str(multiple=False),
                "g": fields.Str(multiple=False),
                "advanced": fields.Bool(multiple=False),
                "orcid": fields.Str(multiple=True)

               }
