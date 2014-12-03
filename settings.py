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
WSGI_STR = ''
GOOGLE_ANALYTICS_CODE = ''
LOG_REQUESTS = False
REPLACE_PUBS_WITH_PUBS_TEST = False


if DEBUG:
    CONTACT_RECIPIENTS = ['ayan@usgs.gov', 'jkreft@usgs.gov']
else:
    CONTACT_RECIPIENTS = ['servicedesk@usgs.gov']


try:
    from local_settings import *
except ImportError:
    pass

# some safety in case REPLACE_PUBS_WITH_PUBS_TEST is set to True
if REPLACE_PUBS_WITH_PUBS_TEST:
    REPLACE_STR = 'pubs-test'
else:
    REPLACE_STR = 'pubs'

# variables used for testing purposes
nose_testing = sys.argv[0].endswith('nosetests') # returns True if 'nosetests' is a command line argument
if 'lettuce' in sys.argv[0]: # determine if a lettuce is being run
    lettuce_testing = True
else:
    lettuce_testing = False
if nose_testing or lettuce_testing:
    WTF_CSRF_ENABLED = False
    TESTING = True
    BASE_SEARCH_URL = 'https://pubs-fake.er.usgs.gov/pubs-services/publication/'