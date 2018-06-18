# Pubs Warehouse Flask Server

This project produces server-rendered HTML pages for the USGS Pubs Warehouse.

## Install dependencies

1. Create a virtualenv and install the project's Python requirements.

```bash
virtualenv --python=python3.6 env
env/bin/pip install -r requirements.txt
```

2. To override any Flask configuration parameters, modify `instance/config.py`.
These will override any values in the project's `config.py`. There is a sample
available:

```bash
mkdir -p instance
cp config.py.sample instance/config.py
```

## Run a development server

To run the Flask development server at
[http://localhost:5050](http://localhost:5050):

```bash
env/bin/python run.py
```

## Tests

This app has Lettuce tests and Python unit tests. To run the Lettuce tests do the following with your virtualenv activated or using the full path name to Lettuce:

```bash
env/bin/lettuce --with-xunit pubs_ui/lettuce_testing
```

To run the unit tests do the following with your virtualenv activated or using the full path name to nosetests:

```bash
nosetests -w pubs_ui
```

## Generating secret keys
If you want to generate a real secret key, you can do so trivially from the Python console by using `os.urandom()` like so:

```python
>>> import os
>>> os.urandom(24)
'\xa1\x89D\x9e+\xb4Pl\xbfr\xa5\xc3\xc1\x05\x9c\x90\x91\x10\xa8\xfa\x10\xe7r\x9e'

```
You can paste the generated string right into your SECRET_KEY global constant

## NOTE: Platform specific issues
On Mac OS, you may have trouble with the proxy to the pubs-services raising the following error:
```
SSLError: [SSL: SSLV3_ALERT_HANDSHAKE_FAILURE] sslv3 alert handshake failure (_ssl.c:590)
```
You can solve this by pip install requests[security] but then the lettuce tests fail with:
```
raise SSLError(e, request=request)
    SSLError: ('bad handshake: WantWriteError()',)
```
