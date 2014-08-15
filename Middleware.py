__author__ = 'jameskreft'
from werkzeug.serving import run_simple
from werkzeug.wsgi import DispatcherMiddleware
from PubsFlask import app as frontend
from pubsflaskapi import app as backend

application = DispatcherMiddleware(frontend, {
    '/backend':     backend
})

if __name__ == '__main__':
    run_simple('localhost', 5000, application,
               use_reloader=True, use_debugger=True, use_evalex=True)
