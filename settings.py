'''
Created on Oct 15, 2014

@author: ayan
'''
DEBUG = True
SERVER_NAME = '127.0.0.1:5050'
SECRET_KEY = ''
VERIFY_CERT = True
COLLECT_STATIC_ROOT = '/static/'
COLLECT_STORAGE = 'flask.ext.collect.storage.file'

try:
    from local_settings import *
except ImportError:
    pass
