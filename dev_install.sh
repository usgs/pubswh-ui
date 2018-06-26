#!/bin/sh -e

echo "This script assumes you have python 2.7, virtualenv, and npm installed. Firefox is required to run the javascript tests"

if [ ! -s server/instance/config.py ]; then
   echo "Please create a instance/config.py file before proceeding. See the README.md for what's required"
   exit
fi

if [ "$1" == "--clean" ]; then
   echo "Cleaning the project"
   rm -rf assets/node_modules;
   rm -rf server/env;
   rm -rf server/static;
   rm -rf server/pubs_ui/static/.webassets-cache;
   rm -rf server/pubs_ui/static/gen;
fi

echo "Creating the virtualenv env if needed and installing requirements"
pushd server
if [ ! -s env ]; then
   virtualenv --python=python2.7 env;
fi
env/bin/pip install -r requirements.txt;
popd

echo "Installing the node dependencies"
pushd assets
npm install;
popd

echo "Successfully installed the pubs_ui app. "
echo "Run all tests"
pushd assets
npx karma start tests/js/manager/karma.conf.js
npx karma start tests/js/metrics/karma.conf.js
npx karma start tests/js/pubswh/karma.conf.js
popd

pushd server
env/bin/nosetests -w pubs_ui;
env/bin/lettuce --with-xunit pubs_ui/lettuce_testing;
popd


echo "When running scripts in this project set up the python interpreter to use env/bin/python."
echo "The development server can be run as follows: env/bin/python run.py"
echo "See the README for instructions on running the tests manually"
echo "See the README for platform specific installation instructions"
