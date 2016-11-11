PubsWarehouse_UI
================

[![Build Status](https://travis-ci.org/USGS-CIDA/PubsWarehouse_UI.svg?branch=master)](https://travis-ci.org/USGS-CIDA/PubsWarehouse_UI)
[![Coverage Status](https://coveralls.io/repos/github/USGS-CIDA/PubsWarehouse_UI/badge.svg)](https://coveralls.io/github/USGS-CIDA/PubsWarehouse_UI)

To get this application running using the flask local dev server you need to create an instance/config.py file
under PubsWarehouse_UI folder.  The contents of the file should look like so:

 ```python
 SECRET_KEY = 'the_secret_key'
 DEBUG = True #you want debug to be true for development, but not production
 ASSETS_DEBUG = True #Set to False if you want to compress assets.
 JS_DEBUG = True #default is False. Set to true if you want the level of logging to be at the debug level.

 # URL for getting publication information
 PUB_URL = "[server of choice]/pubs-services/"
 # URL for getting lookup information- authors, contributing offices, etc
 LOOKUP_URL = "[server of choice]/pubs-services/lookup/"
 # URL for endpoint to get supersede info
 SUPERSEDES_URL = "[server of choice]/service/citation/json/extras?"
 # URL for Browse
 BROWSE_URL = "[server of choice]/browse/"
 # URL for Search
 BASE_SEARCH_URL = "[server of choice]/pubs-services/publication"
 # URL to instert into JSON-LD output- use the local address for local development
 JSON_LD_ID_BASE_URL = 'http://127.0.0.1:5050/'
 # replacement of relative links in the browse interface
 BROWSE_REPLACE = "browse"
 # Code for Google analytics- insert appropriate code for dev or prod. Can be left blank for local development
 GOOGLE_ANALYTICS_CODE = 'GA-CODE-STRING'
 # Code for webmaster tools- needed on prod only
 GOOGLE_WEBMASTER_TOOLS_CODE = 'googlerandomstring'
 # set variable for if robots are welcome to index the site or not 
 ROBOTS_WELCOME = False
 # If logging is turned on or not
 LOGGING_ON = False
 # A string to put into the announcements block on the homepage- can contain html
 ANNOUNCEMENT_BLOCK = ""
 # The endpoint to get an authorization token based on AD credentials
 AUTH_ENDPOINT_URL = '[server of choice]/pubs-services/auth/'
 # The endpoint to get a preview of a pub that is only in mypubs
 PREVIEW_ENDPOINT_URL = '[server of choice]/pubs-services/mppublications/'
 # set the default path for the login page- for local development, it is '/login/'
 LOGIN_PAGE_PATH = '/login/'
 # verify ssl certificate for outside service calls
 VERIFY_CERT = True or False #Set to False for local development
 #cache settings- see the documentation for flask-cache. For development, a cache type of simple works well with the development server.  redis is used on production
 #CACHE_CONFIG = {'CACHE_TYPE': 'simple'}
 #set to the sciecebase folder id for the core publications warehouse SB folder
 SCIENCEBASE_PARENT_UUID = ''
 
 #The following should be removed when we completely retire the old MyPubs Angular app.
 OLD_MYPUBS_ENDPOINT = 'endpoint of the old mypubs application'
 
 #Assuming you use mvn test to install the lessc set LESS_BIN as follows:
 LESS_BIN = 'PROJECT_DIR/node_modules/less/bin/lessc'
 ```
 
To create the virtualenv you should have python 2.7, virtualenv, pip installed. 

To install npm, bower, lessc, and karma  and to install the javascript dependencies use `mvn test` command. These executables are then available to run as follows:
`node/node node_modules/karma/bin/karma`.

Substitute the command that you want to execute for "karma". Consider creating a helper script for karma, bower, npm, and lessc
so that you don't have to remember all of this:
```
#!/bin/sh
"node/node" "node_modules/karma/bin/karma" "$@"
```

You will need to specify the whole path to the less binary (or the script), LESS_BIN, in your instance/config.py. 

If you are on a linux environment, you can run the dev_install.sh script. You should run this every time you pull down 
code but particularly if requirements.txt, package.json or bower.json have been updated. Otherwise these are the steps you need
to take.

1. Create a virtualenv using python 2.7.9 and install the requirements in 'requirements.txt'. This can be done as follows while in the project directory:
  1. Run `virtualenv --python=python2.7 env`
  2. Activate your virtualenv (depends on whether linux or windows)
  3. Run `pip install -r requirements.txt`

2. To install javascript dependencies, lessc, and karma as well as run the jasmine tests, npm must be installed on your machine.
  1. Run `npm install`
  2. Run `bower install`

You can start the app by running `run.py`, which will give you an output like so:

 ```python
 * Running on http://127.0.0.1:5050/
 * Restarting with reloader
 ```

##Tests
This app has lettuce tests, python unit tests and jasmine (javascript) tests. To run the lettuce tests do the following with your virtualenv activated or using the full path name to lettuce:
`lettuce --with-xunit pubs_ui/lettuce_testing`

To run the unit tests do the following with your virtualenv activated or using the full path name to nosetests:
`nosetests -w pubs_ui`

To run the jasmine tests, run the following:
Run `node_modules/karma/bin/karma start tests/js/karma.conf.js`

If you leave the above command running you can
Then go to localhost:9876 in the browser where you want to run the tests. This will have to be altered for Windows users.
This will automatically open the Firefox browser, but any browser can be used to run the tests


## Generating secret keys
If you want to generate a real secret key, you can do so trivially from the Python console by using `os.urandom()` like so:

```python
>>> import os
>>> os.urandom(24)
'\xa1\x89D\x9e+\xb4Pl\xbfr\xa5\xc3\xc1\x05\x9c\x90\x91\x10\xa8\xfa\x10\xe7r\x9e'

```
You can paste the generated string right into your SECRET_KEY global constant

## Platform specific issues
On Mac OS, I have had trouble with the proxy to the pubs-services raising the following error:
```
SSLError: [SSL: SSLV3_ALERT_HANDSHAKE_FAILURE] sslv3 alert handshake failure (_ssl.c:590)
```
I can solve this by pip install requests[security] but then the lettuce tests fail with:
```
raise SSLError(e, request=request)
    SSLError: ('bad handshake: WantWriteError()',)
```