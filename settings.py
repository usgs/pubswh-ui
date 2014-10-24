'''
Created on Oct 15, 2014

@author: ayan
'''
DEBUG = True
SECRET_KEY = ''
VERIFY_CERT = True
COLLECT_STATIC_ROOT = 'static/'
COLLECT_STORAGE = 'flask.ext.collect.storage.file'
PUB_URL = ''
LOOKUP_URL = ''
SUPERSEDES_URL = ''
BROWSE_URL = ''

try:
    from local_settings import *
except ImportError:
    pass
