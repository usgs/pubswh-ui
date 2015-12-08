import logging
from flask import Flask, request
from flask.ext.bower import Bower
from flask.ext.images import Images
from flask_mail import Mail

from custom_filters import display_publication_info, date_format



FORMAT = '%(asctime)s %(message)s'
fmt = logging.Formatter(FORMAT)
handler = logging.FileHandler('pubs_ui.log')
handler.setLevel(logging.INFO)
handler.setFormatter(fmt)


app = Flask(__name__.split()[0], instance_relative_config=True)
app.config.from_object('config')  # load configuration before passing the app object to other things
app.config.from_pyfile('config.py')

@app.before_request
def log_request():
    if app.config.get('LOGGING_ON'):
        request_str = str(request)
        request_headers = str(request.headers)
        log_str = 'Request: ({0}); Headers: ({1})'.format(request_str, request_headers)
        app.logger.info(log_str)


if app.config.get('LOGGING_ON'):
    app.logger.addHandler(handler)
images = Images(app)
mail = Mail(app)
app.view_functions['images'] = images.handle_request
app.jinja_env.filters['display_pub_info'] = display_publication_info
app.jinja_env.filters['date_format'] = date_format
app.jinja_env.globals.update(wsgi_str=app.config['WSGI_STR'])
app.jinja_env.globals.update(GOOGLE_ANALYTICS_CODE=app.config['GOOGLE_ANALYTICS_CODE'])
app.jinja_env.globals.update(GOOGLE_WEBMASTER_TOOLS_CODE=app.config['GOOGLE_WEBMASTER_TOOLS_CODE'])
app.jinja_env.globals.update(LAST_MODIFIED=app.config.get('DEPLOYED'))
app.jinja_env.globals.update(ANNOUNCEMENT_BLOCK=app.config['ANNOUNCEMENT_BLOCK'])

# Creates the bower blueprint
bower = Bower(app)

import assets

from auth.views import auth
from manager.views import manager
from pubswh.views import pubswh

app.register_blueprint(auth)
app.register_blueprint(pubswh)
app.register_blueprint(manager,
                       url_prefix='/manager')
