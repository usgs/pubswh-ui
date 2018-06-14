# PubsWarehouse_UI

[![Build Status](https://travis-ci.org/USGS-CIDA/PubsWarehouse_UI.svg?branch=master)](https://travis-ci.org/USGS-CIDA/PubsWarehouse_UI)
[![Coverage Status](https://coveralls.io/repos/github/USGS-CIDA/PubsWarehouse_UI/badge.svg)](https://coveralls.io/github/USGS-CIDA/PubsWarehouse_UI)

To create the virtualenv you should have python 2.7, virtualenv, pip installed.

This application should be built using python 2.7 and node version > 8.x.x.

## Install dependencies

The repository contains a make target to configure a local development environment:

```bash
make env
```

To manually configure your environment, please see the READMEs of each separate project.

## Development server

To run all development servers in a watch mode at the same time, use the make target:

```bash
make watch
```

... and to run each dev server individually:

```bash
make watch-server
make watch-assets
```

See the specific project READMEs for additional information.

- [Flask Server README](./server/README.md)
- [Assets README](./assets/README.md)

## Run tests

To run all project tests:

```bash
make test
```

## Production build

```bash
make build
```

## Clean targets

```bash
make clean      ; clean build artifacts
make cleanenv   ; clean environment configuration and build artifacts
```

`make` supports chaining targets, so you could also `make clean watch`, etc.
