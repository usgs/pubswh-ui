#!/bin/sh

echo "This script assumes you have python 2.7, pip and virtualenv installed."
if [ ! -s instance/config.py ]; then
   echo "Please create a instance/config.py file before proceeding. See the README.md for what's required"
   exit
fi

echo "Creating the virtualenv env and installing requirements"
virtualenv --python=python2.7 env
. env/bin/activate
pip install -r requirements.txt

echo "Install javascript dependancies and run tests"
mvn clean test

echo "Successfully installed the pubs_ui app. "
echo "When running scripts in this project set up the python interpreter to use env/bin/python."
echo "The development server can be run as follows: env/bin/python run.py"
echo "See the README for instructions on running the tests manually"
