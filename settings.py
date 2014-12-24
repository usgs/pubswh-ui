'''
Created on Oct 15, 2014

@author: ayan
'''
import sys
from datetime import timedelta


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
RECAPTCHA_PUBLIC_KEY = '6LfisP0SAAAAAKcg5-a5bEeV4slFfQZr5_7XfqXf'  # using google's recaptcha API
RECAPTCHA_PRIVATE_KEY = ''  # see RECAPTCHA_PRIVATE_KEY in local_settings.py
WSGI_STR = ''
GOOGLE_ANALYTICS_CODE = ''
JSON_LD_ID_BASE_URL = ''
GOOGLE_WEBMASTER_TOOLS_CODE = 'ertoifsdbnerngdjnasdw9rsdn'  # random string, set real code in local_settings.py on prod
ANNOUNCEMENT_BLOCK = ''
LOGGING_ON = False
REPLACE_PUBS_WITH_PUBS_TEST = False
ROBOTS_WELCOME = False
REMEMBER_COOKIE_DURATION = timedelta(days=1)
AUTH_ENDPOINT_URL = ''
PREVIEW_ENDPOINT_URL = ''
LOGIN_PAGE_PATH = ''



if DEBUG:
    CONTACT_RECIPIENTS = ['ayan@usgs.gov', 'jkreft@usgs.gov']
else:
    CONTACT_RECIPIENTS = ['servicedesk@usgs.gov']


try:
    from local_settings import *
except ImportError:
    pass


try:
    from deploy_date import *
except ImportError:
    pass

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