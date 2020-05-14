# USGS Publications Warehouse User Interface

[![Build Status](https://travis-ci.com/usgs/pubswh-ui.svg?branch=master)](https://travis-ci.com/usgs/pubswh-ui)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/1f1df7eea3b04596bdb66fcaccb095e1)](https://www.codacy.com/app/usgs_wma_dev/pubswh-ui?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=usgs/pubswh-ui&amp;utm_campaign=Badge_Grade)
[![codecov](https://codecov.io/gh/usgs/pubswh-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/usgs/pubswh-ui)

The Pubs Warehouse provides access to over 150,000 publications written by USGS
scientists over the century-plus history of the bureau.

This repo contains the front-end components of the Publications Warehouse:

- [`server`](server): A Flask web application that is used to create server-rendered pages
- [`assets`](assets): Client-side Javascript, CSS, images, etc.

This application should be built using Python 3.X and Node.js version > 10.x.x.

## Local Development - Makefile configuration
Application configuration may be specified by creating an instance config in server/instance/config.py. This 
configuration overrides variables in the default one (server/config.py). The make env target will copy a 
sample, server/config.py.sample, as a convenience if one doesn't exist. By default these will point to 
production services.

### Install dependencies

The repository contains a make target to configure a local development environment:

```bash
make env
```

To manually configure your environment, please see the READMEs of each separate project.

### Development server

To run all development servers in a watch mode at the same time, use the make target:

```bash
make watch
```

... and to run each dev server individually:

```bash
make watch-server
make watch-assets
```

The make env command will create a config.py in the ```server/instance``` directory if one
does not exist by copy the file ```server/config.py.sample``` to the directory. Any config
variable defined in ```server/config.py``` can be overridden by assigning a value
to that variable in the ```server/instance/config.py``` file. Please note that
variables that are required (as described in the Docker section below) must have
values in ```server/instance/config.py```

See the specific project READMEs for additional information.

- [Flask Server README](./server/README.md)
- [Assets README](./assets/README.md)

### Run tests

To run all project tests:

```bash
make test
```

### Production build

```bash
make build
```

### Clean targets

```bash
make clean      ; clean build artifacts
make cleanenv   ; clean environment configuration and build artifacts
```

`make` supports chaining targets, so you could also `make clean watch`, etc.

## Local Development - Docker configuration

Two containers are provided - one for node-based build tooling, the second for
a Python server container. You will need to have a clean directory before starting.
```bash
make cleanenv
```
### Docker Build

```bash
docker-compose build
```
There are three build_args that can be used to add additional arguments to the npm, bower, and pip install steps
```text
--build-arg npm_args=--options --build-arg=pip_install_args=--options --build-arg bower_args=--config.options
```

### Docker Development server

You will need to provide the environment variables needed to run the application. The environment variables that
can be read can be found in ```server/config.py```. Set the appropriate environment
variables in the `local.env` file in the root directory of the project.  Note that if ```server/instance/config.py```
is not empty, it's contents will override the environment variables set below. If you may use that rather than create
```local.env```. Example `local.env` file:
```text
SECRET_KEY=<should not be public>
PUB_URL=<url to pubs service>
LOOKUP_URL=<ulr to pubs lookup service>
BASE_SEARCH_URL=<url to publications search service>
JSON_LD_ID_BASE_URL=<url to use when constructing JSON responses that have a 'url' attribute>
PREVIEW_ENDPOINT_URL=<url to publication that are not public>
PUBSAUTH_CLIENT_ID=<pubs auth client id>
PUBS_AUTH_CLIENT_SECRET=<pubs auth client secret (may be empty)>
PUBSAUTH_ACCESS_TOKEN_URL=https://www.sciencebase.gov/auth/realms/PubsWH/protocol/openid-connect/token
PUBSAUTH_AUTHORIZE_URL=https://www.sciencebase.gov/auth/realms/PubsWH/protocol/openid-connect/auth
PUBSAUTH_API_BASE_URL=https://www.sciencebase.gov/auth/realms/PubsWH/protocol/openid-connect
STATIC_ROOT=http://localhost:9000
```

In addition, the following optional environment variables should be set appropriately. If not set they will be
the empty string unless otherwise noted
```text
DEBUG=<any string to turn on debug mode>
JS_DEBUG=<any string to turn on javascript debugging>
LOGGING_ON=<any string to turn on logging>
NO_VERIFY_CERT=<any string to not verify certs>
RECAPTCHA_PRIVATE_KEY=<private string for recaptcha>
WSGI_STR=<string to be appended to routes - typically needed at EROS>
GOOGLE_ANALYTICS_CODE=<GA code>
GOOGLE_WEBMASTER_TOOLS_CODE=<Google webmaster tools code string>
ANNOUNCEMENT_BLOCK=<string for general announcements>
ROBOTS_WELCOME=<any string to allow robots to scan pages>
CACHE_TYPE=<set to redis if using redis cache>
CACHE_REDIS_HOST=<set to redis host>
CACHE_KEY_PREFIX=<set to prefix to use for caching>
REDIS_CONFIG=<db:password@host:port>
IMAGES_CACHE=<path to image cache for thumbnails>
SCIENCEBASE_PARENT_UUID=<sciencebase foler id for publications warehouse>
GA_KEY_FILE_PATH=< path to the location of the google analytices service account key>
ALTIMETRIC_KEY=<altimetric key>
ASSET_MANIFEST_PATH=<If using hashed assets, PATH_IN_CONTAINER/static/assets/rev-manifest.json
MAIL_SERVER=<Will default to localhost>
```
```bash
# Run in the foreground
docker-compose up

# Run in the background
docker-compose up -d

# Run just the Python dev server on port 5050
docker-compose up server

# Run just the node.js build server on port 9000
docker-compose up assets
```

### Docker run tests

```bash
# Run Python server tests
docker-compose -f docker-compose.yml -f docker-compose.ci.yml run -u root server

# Run Javascript tests
docker-compose -f docker-compose.yml -f docker-compose.ci.yml run assets
```