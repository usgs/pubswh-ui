PubsWarehouse_UI
================

To get this application running using the flask local dev server, there are three steps:

1. Create a virtualenv using python 2.7.5 and add everything in the `requirements.txt` file
 
2. Create a  `local_settings.py` file under PubsWarehouse_UI folder, and add this file to .gitignore.  The contents of the files should looks like so:

 ```python
 SECRET_KEY = 'the_secret_key'
 DEBUG = True #you want debug to be true for development, but not production

 #URL for getting publication information
 PUB_URL = "[server of choice]/pubs-services/"
 #URL for getting lookup information- authors, contributing offices, etc
 LOOKUP_URL = "[server of choice]/pubs-services/lookup/"
 #URL for endpoint to get supersede info
 SUPERSEDES_URL = "[server of choice]/service/citation/json/extras?"

 ```

3. After you have created your `local_settings.py`, you can start the app by running `runserver.py`, which will give you an output like so:

 ```python
 * Running on http://127.0.0.1:5050/
 * Restarting with reloader
 ```

---

If you want to generate a real secret key, you can do so trivially from the Python console by using `os.urandom()` like so:

```python
>>> import os
>>> os.urandom(24)
'\xa1\x89D\x9e+\xb4Pl\xbfr\xa5\xc3\xc1\x05\x9c\x90\x91\x10\xa8\xfa\x10\xe7r\x9e'

```
You can paste the generated string right into your SECRET_KEY global constant