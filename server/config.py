"""
Base configuration settings for Pubs Warehouse
"""

from datetime import timedelta
import os
import sys

PROJECT_HOME = os.path.dirname(__file__)

DEBUG = False
JS_DEBUG = False

SECRET_KEY = ''
VERIFY_CERT = True  # verify SSL certs during web service calls by requests, can be a path to a cert bundle
COLLECT_STATIC_ROOT = 'static/'  # directory where static files should be placed during a build
MAIL_USERNAME = 'PUBSV2_NO_REPLY'
PUB_URL = ''  # root pubs services URL
LOOKUP_URL = ''
SUPERSEDES_URL = ''
BASE_SEARCH_URL = ''  # pubs services search endpoint
RECAPTCHA_PUBLIC_KEY = '6LfisP0SAAAAAKcg5-a5bEeV4slFfQZr5_7XfqXf'  # using google's recaptcha API
RECAPTCHA_PRIVATE_KEY = ''  # see RECAPTCHA_PRIVATE_KEY in instance/config.py
WSGI_STR = ''  # string that should be appended to routes on OWI virtual machines
GOOGLE_ANALYTICS_CODE = ''  # Google analytics code (e.g. UA-9302130-2)
JSON_LD_ID_BASE_URL = ''  # URL to use when constructing JSON reponses that have a `url` attribute
GOOGLE_WEBMASTER_TOOLS_CODE = 'ertoifsdbnerngdjnasdw9rsdn'  # random string, set real code in instance/config.py on prod
ANNOUNCEMENT_BLOCK = ''  # some text for general announcments on the website
LOGGING_ON = False
REPLACE_PUBS_WITH_PUBS_TEST = False  # hack to deal with pubs-test URL mapping on QA virtual machines
ROBOTS_WELCOME = False
REMEMBER_COOKIE_NAME = 'remember_token'  # name of the authentication token
REMEMBER_COOKIE_DURATION = timedelta(days=1)  # time to remember the authentication token
AUTH_ENDPOINT_URL = ''  # pubs services authentication endpoint
PREVIEW_ENDPOINT_URL = ''  # pubs services endpoint for publications currently in the manager app
CACHE_CONFIG = {'CACHE_TYPE': 'null'}
REDIS_CONFIG = ''
IMAGE_CACHE = ''  # path to image cache for thumbnails
SCIENCEBASE_PARENT_UUID = ''  # set to the sciecebase folder id for the core publications warehouse SB folder

#These should be set in order to authenticate for the manager application
PUBSAUTH_CLIENT_ID = ''
PUBSAUTH_CLIENT_SECRET = ''
PUBSAUTH_ACCESS_TOKEN_URL = ''
PUBSAUTH_AUTHORIZE_URL = ''
PUBSAUTH_API_BASE_URL = ''

CONTACT_RECIPIENTS = ['servicedesk@usgs.gov']  # recipient address

IPDS_CONTACT_RECIPIENTS = ['GS_Help_IPDS@usgs.gov']

# Location of file containing the google analytics service account's JSON key.
GA_KEY_FILE_PATH = ''
GA_OAUTH2_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
GA_PUBS_VIEW_ID = 'ga:20354817'
GA_DISCOVERY_URI = ('https://analyticsreporting.googleapis.com/$discovery/rest')

# Altmetric API information
ALTMETRIC_KEY = ''
ALTMETRIC_ENDPOINT = 'https://api.altmetric.com/v1/'

# Crossref API information
CROSSREF_ENDPOINT = 'https://api.crossref.org'

try:
    from deploy_date import *  # pylint: disable=W0401
except ImportError:
    pass

#
# Variables used for testing purposes
#
#
# True if 'nosetests' is a command line argument
nose_testing = sys.argv[0].endswith('nosetests')  # pylint: disable=C0103

# Determine if a lettuce is being run
lettuce_testing = 'lettuce' in sys.argv[0]  # pylint: disable=C0103

if nose_testing or lettuce_testing:
    WTF_CSRF_ENABLED = False
    TESTING = True
    BASE_SEARCH_URL = 'https://pubs-fake.er.usgs.gov/pubs-services/publication/'
    PUB_URL = 'https://pubs-fake.er.usgs.gov/pubs-services/'
    SUPERSEDES_URL = 'http://cida-eros-pubsfake.er.usgs.gov:8080/pubs2_ui/service/citation/json/extras?'

# Use Flask-Cors to enable cross-origin requests. Useful for local development,
# when static assets are hosted on a different port than the Flask dev server.
FLASK_CORS = False

# To use hashed assets, set this to the gulp-rev-all rev-manifest.json path
ASSET_MANIFEST_PATH = None
