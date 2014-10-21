'''
Created on Oct 21, 2014

@author: mwernimont
'''
SECRET_KEY = 'Y\xef\xc6\xcd\n=\xd6h\xcds|\xba\xab\x9d%\xde&\x1b\x07Z\x8a\xdfK\x92'
DEBUG = True #you want debug to be true for development, but not production

#URL for getting publication information
PUB_URL = "https://cida-eros-pubsdev.er.usgs.gov:8443/pubs-services/"
#URL for getting lookup information- authors, contributing offices, etc
LOOKUP_URL = "https://cida-eros-pubsdev.er.usgs.gov:8443/pubs-services/lookup/"
#URL for endpoint to get supersede info
SUPERSEDES_URL = "http://cida-eros-pubsdev.er.usgs.gov:8080/pubs2_ui/service/citation/json/extras?"

#verify ssl certificate for outside service calls
VERIFY_CERT = False