#
# Entrypoint Makefile for Pubs Warehouse UI
#

default: build

help:
	@echo  'Pubs Warehouse UI Makefile targets:'
	@echo  '  build (default) - Produce the build artifact for each project'
	@echo  '  env - Create a local development environment'
	@echo  '  watch - Run local development servers'
	@echo  '  test - Run all project tests'
	@echo  '  clean - Remove all build artifacts'
	@echo  '  cleanenv - Remove all environment artifacts'

include assets/Makefile
include server/Makefile

.PHONY: help env test clean cleanenv coverage

MAKEPID:= $(shell echo $$PPID)

env: env-assets env-server
test: test-assets test-server
clean: clean-assets clean-server
cleanenv: cleanenv-assets cleanenv-server
build: env build-assets build-server
watch:
	(make watch-server & \
	 make watch-assets & \
	 wait) || kill -TERM $(MAKEPID)
coveralls:
	cp assets/coverage/manager/Firefox*/lcov.info assets/coverage/manager.info
	cp assets/coverage/metrics/Firefox*/lcov.info assets/coverage/metrics.info
	cp assets/coverage/pubswh/Firefox*/lcov.info assets/coverage/pubswh.info
	lcov --add-tracefile assets/coverage/manager.info --add-tracefile assets/coverage/metrics.info --add-tracefile assets/coverage/pubswh.info --output-file assets/coverage/combined.info
	coveralls-lcov -v -n assets/coverage/combined.info > assets/coverage/coverage.json
	cd server && env/bin/coveralls --merge=../assets/coverage/coverage.json
