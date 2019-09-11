"""
Base configuration settings for Pubs Warehouse
"""

import os
import re

# pylint: disable=C0103

PROJECT_HOME = os.path.dirname(__file__)

DEBUG = 'DEBUG' in os.environ
# Set to true if the log level in the javascript should be at debug level
JS_DEBUG = 'JS_DEBUG' in os.environ

LOGGING_ON = 'LOGGING_ON' in os.environ

# Do not use the same key as any of the deployment servers
SECRET_KEY = os.environ.get('SECRET_KEY')

# verify SSL certs during web service calls by requests, can be a path to a cert bundle
VERIFY_CERT = 'NO_VERIFY_CERT' not in os.environ

# SERVICE ENDPOINTS
PUB_URL = os.environ.get('PUB_URL')  # root pubs services URL
LOOKUP_URL = os.environ.get('LOOKUP_URL')
BASE_SEARCH_URL = os.environ.get('BASE_SEARCH_URL')  # pubs services search endpoint
# URL to use when constructing JSON reponses that have a `url` attribute
JSON_LD_ID_BASE_URL = os.environ.get('JSON_LD_ID_BASE_URL', '')
# pubs services endpoint for publications currently in the manager app
PREVIEW_ENDPOINT_URL = os.environ.get('PREVIEW_ENDPOINT_URL')

RECAPTCHA_PUBLIC_KEY = '6LfisP0SAAAAAKcg5-a5bEeV4slFfQZr5_7XfqXf'  # using google's recaptcha API
RECAPTCHA_PRIVATE_KEY = os.environ.get('RECAPTCHA_PRIVATE_KEY')

WSGI_STR = os.environ.get('WSGI_STR', '')  # string that should be appended to routes on OWI virtual machines

GOOGLE_ANALYTICS_CODE = os.environ.get('GOOGLE_ANALYTICS_CODE', '')  # Google analytics code (e.g. UA-9302130-2)
GOOGLE_WEBMASTER_TOOLS_CODE = os.environ.get('GOOGLE_WEBMASTER_TOOLS_CODE', '')  # random string

ANNOUNCEMENT_BLOCK = os.environ.get('ANNOUNCEMENT_BLOCK', '')  # some text for general announcments on the website
ROBOTS_WELCOME = 'ROBOTS_WELCOME' in os.environ

# Settings for Flask-Cache
CACHE_TYPE = os.environ.get('CACHE_TYPE', 'null')
CACHE_REDIS_HOST = os.environ.get('CACHE_REDIS_HOST', '')  # Only needed if CACHE_TYPE is 'redis'
CACHE_KEY_PREFIX = os.environ.get('CACHE_KEY_PREFIX', '')

# Set REDIS_CONFIG if it exists
# Should be of form: db:password@host:port
REDIS_CONFIG = os.environ.get('REDIS_CONFIG')
if REDIS_CONFIG:
    groups = re.search(r'(\d+):([^\/.]+?)@(.+):(\d+)', REDIS_CONFIG).groups()
    REDIS_CONFIG = {
        'db': groups[0],
        'password': groups[1],
        'host': groups[2],
        'port': groups[3]
    }
if 'IMAGES_CACHE' in os.environ:
    IMAGES_CACHE = os.environ.get('IMAGES_CACHE')  # path to image cache for thumbnails
# set to the sciecebase folder id for the core publications warehouse SB folder
SCIENCEBASE_PARENT_UUID = os.environ.get('SCIENCEBASE_PARENT_UUID', '')

#These should be set to authenticate the manager application
PUBSAUTH_CLIENT_ID = os.environ.get('PUBSAUTH_CLIENT_ID')
PUBSAUTH_CLIENT_SECRET = os.environ.get('PUBSAUTH_CLIENT_SECRET')
PUBSAUTH_ACCESS_TOKEN_URL = os.environ.get('PUBSAUTH_ACCESS_TOKEN_URL')
PUBSAUTH_AUTHORIZE_URL = os.environ.get('PUBSAUTH_AUTHORIZE_URL')
PUBSAUTH_API_BASE_URL = os.environ.get('PUBSAUTH_API_BASE_URL')

CONTACT_RECIPIENTS = ['servicedesk@usgs.gov']  # recipient address

IPDS_CONTACT_RECIPIENTS = ['GS_Help_IPDS@usgs.gov']

# Location of file containing the google analytics service account's JSON key.
GA_KEY_FILE_PATH = os.environ.get('GA_KEY_FILE_PATH', '')
GA_OAUTH2_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
GA_PUBS_VIEW_ID = 'ga:20354817'
GA_DISCOVERY_URI = ('https://analyticsreporting.googleapis.com/$discovery/rest')

# Altmetric API information
ALTMETRIC_KEY = os.environ.get('ALTMETRIC_KEY')
ALTMETRIC_ENDPOINT = 'https://api.altmetric.com/v1/'

# Crossref API information
CROSSREF_ENDPOINT = 'https://api.crossref.org'

# Unpaywall API information
UNPAYWALL_ENDPOINT = 'https://api.unpaywall.org/v2/'

try:
    from deploy_date import *  # pylint: disable=W0401
except ImportError:
    pass

# Use Flask-Cors to enable cross-origin requests. Useful for local development,
# when static assets are hosted on a different port than the Flask dev server.
# TODO Is Flask-Cors really needed. WQP doesn't need this
FLASK_CORS = False

# To use hashed assets, set this to the gulp-rev-all rev-manifest.json path
ASSET_MANIFEST_PATH = os.environ.get('ASSET_MANIFEST_PATH', '')

# Used when initializing WhiteNoise (http://whitenoise.evans.io/en/stable/index.html),
# set this to the path where the static assets will live.
STATIC_ASSET_PATH = os.environ.get('STATIC_ASSET_PATH')

# Set to False when running the development server on https
SECURE_COOKIES = True

if 'STATIC_ROOT' in os.environ:
    STATIC_ROOT = os.environ.get('STATIC_ROOT')

# This will eventually be a url for pulling html from pubs-services
with open("/home/ssoper/sourceCode/pubswh-ui/server/pubs_ui/pubswh/tests/sample_html.html") as f:
    HTML_ENDPOINT = f.read()

# This is a url for pulling images from SPN
SPN_IMAGE_URL = 'https://pubs.usgs.gov/xml_test/Images/'

STATIC_ROOT = os.environ.get('STATIC_ROOT', '/static/')

