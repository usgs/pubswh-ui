PubsWarehouse_UI
================

to get this application running using the flask dev server, you need to create a  `local_settings.py` file under PubsWarehouse_UI folder, and add this file to .gitignore
There is more to do to hook this to Jenkins.

```python
SECRET_KEY = 'the_secret_key'
DEBUG = True #you want debug to be true for development, but not production

#these are the URLS to use to point to the backing services

#URL for getting publication information
PUB_URL = "[server of choice]/pubs-services/"
#URL for getting lookup information- authors, contributing offices, etc
LOOKUP_URL = "[server of choice]/pubs-services/lookup/"
#URL for endpoint to get supersede info
SUPERSEDES_URL = "[server of choice]/service/citation/json/extras?"

```
---

After you have created your `local_settings.py` to actually get the app up and running, you need to run `runserver.py`

---

If you want to generate a real secret key, you can do so trivially from the Python console by using `os.random()` like so:

```
>>> import os
>>> os.urandom(24)
'\xa1\x89D\x9e+\xb4Pl\xbfr\xa5\xc3\xc1\x05\x9c\x90\x91\x10\xa8\xfa\x10\xe7r\x9e'

```
You can paste the generated string right into your SECRET_KEY global constant