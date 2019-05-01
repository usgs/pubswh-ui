PYTHON := server/env/bin/python
PIP := server/env/bin/pip

.PHONY: env-server test-server clean-server cleanenv-server watch-server

build-server: build-assets flask-collect
	@echo 'Building server...'
	cd server && ./env/bin/python setup.py bdist_wheel

flask-collect:
	@echo 'Collecting static files...'
	cd server && ./env/bin/python manage.py collect
	cd server/static && ln -sfn ../../assets/dist assets

clean-server:
	@echo 'Cleaning server...'
	rm -rf server/dist
	rm -rf server/build
	rm -rf server/static
	rm -rf server/usgs_flask_pubs_ui.egg-info


#
# Development targets
#
test-server:
	cd server && env/bin/coverage run --omit=pubs_ui/*/tests/*.py,env/* -m pytest pubs_ui/

watch-server:
	$(PYTHON) server/run.py

lint-server:
	cd server && env/bin/pylint pubs_ui

#
# Environment configuration targets
#
env-server: server/env server/instance/config.py server-env-requirements

server/env:
	@echo 'Creating the virtualenv env'
	virtualenv --python=python3.6 --no-download server/env

server-env-requirements:
	@echo 'Installing requirements.txt'
	$(PIP) install -r server/requirements.txt -r server/requirements-dev.txt

server/instance/config.py:
	@echo 'Creating server/instance/config.py...'
	mkdir -p server/instance
	cp server/config.py.sample server/instance/config.py

cleanenv-server: clean-server
	@echo 'Cleaning server environment...'
	rm -rf server/env
