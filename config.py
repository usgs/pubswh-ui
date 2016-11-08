from datetime import timedelta
import os
import sys

PROJECT_HOME = os.path.dirname(__file__)

DEBUG = False
JS_DEBUG = False

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
RECAPTCHA_PRIVATE_KEY = ''  # see RECAPTCHA_PRIVATE_KEY in instance/config.py
WSGI_STR = ''
GOOGLE_ANALYTICS_CODE = ''
JSON_LD_ID_BASE_URL = ''
GOOGLE_WEBMASTER_TOOLS_CODE = 'ertoifsdbnerngdjnasdw9rsdn'  # random string, set real code in instance/config.py on prod
ANNOUNCEMENT_BLOCK = ''
LOGGING_ON = False
REPLACE_PUBS_WITH_PUBS_TEST = False
ROBOTS_WELCOME = False
REMEMBER_COOKIE_NAME = 'remember_token'
REMEMBER_COOKIE_DURATION = timedelta(days=1)
AUTH_ENDPOINT_URL = ''
PREVIEW_ENDPOINT_URL = ''
LOGIN_PAGE_PATH = ''
CACHE_CONFIG = {'CACHE_TYPE': 'null'}
REDIS_CONFIG = ''
SCIENCEBASE_PARENT_UUID = '' #set to the sciecebase folder id for the core publications warehouse SB folder
# set to solve problem with backgrid-paginator
BOWER_TRY_MINIFIED = False

#Config for Flask-Assets
ASSETS_DEBUG = False # to disable compression of js and css set to True
ASSETS_AUTO_BUILD = False #Local developers will typically set this to True in their instance/config.py.
LESS_BIN = os.path.join(PROJECT_HOME, 'node_modules', 'less', 'bin', 'lessc')

CONTACT_RECIPIENTS = ['servicedesk@usgs.gov']

# Location of file containing the google analytics service account's JSON key.
GA_KEY_FILE_PATH = ''
GA_OAUTH2_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
GA_PUBS_VIEW_ID = 'ga:20354817'


try:
    from deploy_date import *
except ImportError:
    pass

# variables used for testing purposes
nose_testing = sys.argv[0].endswith('nosetests')  # returns True if 'nosetests' is a command line argument
if 'lettuce' in sys.argv[0]:  # determine if a lettuce is being run
    lettuce_testing = True
else:
    lettuce_testing = False
if nose_testing or lettuce_testing:
    WTF_CSRF_ENABLED = False
    TESTING = True
    BASE_SEARCH_URL = 'https://pubs-fake.er.usgs.gov/pubs-services/publication/'
    PUB_URL = 'https://pubs-fake.er.usgs.gov/pubs-services/'
    SUPERSEDES_URL = 'http://cida-eros-pubsfake.er.usgs.gov:8080/pubs2_ui/service/citation/json/extras?'