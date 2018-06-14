#!/bin/bash

pushd server
env/bin/python setup.py sdist
popd
