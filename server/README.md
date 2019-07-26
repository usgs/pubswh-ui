# Pubs Warehouse Flask Server

This project produces server-rendered HTML pages for the USGS Pubs Warehouse.

## Install dependencies

1. Create a virtualenv and install the project's Python requirements.

```bash
virtualenv --python=python3 env
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

This app has tests that can be run as follows:
```bash
env/bin/coverage run --omit=pubs_ui/*/tests/*.py,env/* -m pytest pubs_ui/
```

## Generating secret keys
If you want to generate a real secret key, you can do so trivially from the Python console by using `os.urandom()` like so:

```python
>>> import os
>>> os.urandom(24)
'\xa1\x89D\x9e+\xb4Pl\xbfr\xa5\xc3\xc1\x05\x9c\x90\x91\x10\xa8\xfa\x10\xe7r\x9e'

```
You can paste the generated string right into your SECRET_KEY global constant

## Installing Redis for local development
Note that Redis does not support Windows, but there is a Windows port (see the link below)). These instructions
are for Linux or MacOS. There is a brew recipe for MacOS which I have not tested

Get the latest stable release from https://redis.io/download. You will install it as follows.

`% tar xzf redis-3.2.8.tar.gz`
`% make` will make in the current directory, or `sudo make install` to but the executable in /usr/local/bin

You can run the redis server by using the redis_server executable in the src directory.
`% src/redis-server`

Test by running `src/redis-cli ping`. The response should be `PONG`.

To use redis in the application set the following in your instance/config.py:
```python
REDIS_CONFIG = {
    'host': 'localhost',
    'port': 6379,
    'db': 0
}
r = StrictRedis(host=REDIS_CONFIG['host'], port=REDIS_CONFIG['port'], db=REDIS_CONFIG['db'])
CACHE_CONFIG = {'CACHE_TYPE': 'redis', 'CACHE_REDIS_HOST': r, 'CACHE_KEY_PREFIX': 'pubs_http'}
```


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
