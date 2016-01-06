#!/bin/sh

echo "This script assumes you have python 2.7, pip and virtualenv installed."
echo "You will also need to have bower and lessc installed (npm install -g bower and npm install -g less)"
echo "Also recommend that you install karma-cli which allows you to more easily run karma tests by not having to specify the path to karma
if [ ! -s instance/config.py ]; then
   echo "Please create a instance/config.py file before proceeding. See the README.md for what's required"
   exit
fi

echo "Creating the virtualenv env and installing requirements"
virtualenv --python=python2.7 env
. env/bin/activate
pip install -r requirements.txt

echo "Install test runner and karma command line interface"
npm install


echo "Install javascript dependencies"
bower install

echo "Successfully installed the pubs_ui app. "
echo "When running scripts in this project set up the python interpreter to use env/bin/python."
echo "The development server can be run as follows: env/bin/python run.py"

