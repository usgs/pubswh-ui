'''
Created on Oct 15, 2014

@author: ayan
'''
import sys


DEBUG = True
SECRET_KEY = ''
VERIFY_CERT = True
COLLECT_STATIC_ROOT = 'static/'
COLLECT_STORAGE = 'flask.ext.collect.storage.file'
MAIL_USERNAME = 'PUBSV2_NO_REPLY'
PUB_URL = ''
LOOKUP_URL = ''
SUPERSEDES_URL = ''
BROWSE_URL = ''
BASE_SEARCH_URL = ''
BASE_CITATION_URL = ''
BROWSE_REPLACE = ''
RECAPTCHA_PUBLIC_KEY = '6LfisP0SAAAAAKcg5-a5bEeV4slFfQZr5_7XfqXf' # using google's recaptcha API
RECAPTCHA_PRIVATE_KEY = '' # see RECAPTCHA_PRIVATE_KEY in local_settings.py


if DEBUG:
    CONTACT_RECIPIENTS = ['ayan@usgs.gov', 'jkreft@usgs.gov']
else:
    CONTACT_RECIPIENTS = ['servicedesk@usgs.gov']


try:
    from local_settings import *
except ImportError:
    pass

# variables used for testing purposes
testing = sys.argv[0].endswith('nosetests')
if testing:
    BASE_SEARCH_URL = 'https://pubs-fake.er.usgs.gov/pubs-services/publication/'