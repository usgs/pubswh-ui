#!/bin/sh -e

echo "This script assumes you have python 2.7, virtualenv, and npm installed. Firefox is required to run the javascript tests"

if [ ! -s instance/config.py ]; then
   echo "Please create a instance/config.py file before proceeding. See the README.md for what's required"
   exit
fi

if [ "$1" == "--clean" ]; then
   echo "Cleaning the project"
   rm -rf node_modules;
   rm -rf env;
   rm -rf static;
   rm -rf pubs_ui/bower_components;
   rm -rf pubs_ui/static/.webassets-cache;
   rm -rf pubs_ui/static/gen;
fi

echo "Creating the virtualenv env if needed and installing requirements"
if [ ! -s env ]; then
    virtualenv --python=python2.7 env;
fi
env/bin/pip install -r requirements.txt;

echo "Installing the node and bower dependencies"
npm install;
node_modules/bower/bin/bower install;

echo "Successfully installed the pubs_ui app. "
echo "Run all tests"
node_modules/karma/bin/karma start tests/js/manager/karma.conf.js
node_modules/karma/bin/karma start tests/js/metrics/karma.conf.js
env/bin/nosetests -w pubs_ui;
env/bin/lettuce --with-xunit pubs_ui/lettuce_testing;



echo "When running scripts in this project set up the python interpreter to use env/bin/python."
echo "The development server can be run as follows: env/bin/python run.py"
echo "See the README for instructions on running the tests manually"
echo "See the README for platform specific installation instructions"
