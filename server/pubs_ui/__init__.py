import json
import logging

from flask import Flask, request
from flask_bower import Bower
from flask_caching import Cache
from flask_images import Images
from flask_mail import Mail

from custom_filters import display_publication_info, date_format, w3c_date


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
app.jinja_env.filters['w3c_date'] = w3c_date
app.jinja_env.globals.update(wsgi_str=app.config['WSGI_STR'])
app.jinja_env.globals.update(GOOGLE_ANALYTICS_CODE=app.config['GOOGLE_ANALYTICS_CODE'])
app.jinja_env.globals.update(GOOGLE_WEBMASTER_TOOLS_CODE=app.config['GOOGLE_WEBMASTER_TOOLS_CODE'])
app.jinja_env.globals.update(LAST_MODIFIED=app.config.get('DEPLOYED'))
app.jinja_env.globals.update(ANNOUNCEMENT_BLOCK=app.config['ANNOUNCEMENT_BLOCK'])

# Set up the cache
cache = Cache(app, config=app.config.get('CACHE_CONFIG'))

# Creates the bower blueprint
bower = Bower(app)

# Load static assets manifest file, which maps source file names to the
# corresponding versioned/hashed file name.
_manifest_path = app.config.get('ASSET_MANIFEST_PATH')
if _manifest_path:
    with open(_manifest_path, 'r') as f:
        app.config['ASSET_MANIFEST'] = json.loads(f.read())

# Enable CORS, if specified in the configuration.
if app.config.get('FLASK_CORS'):
    from flask_cors import CORS
    CORS(app)

import assets

from auth.views import auth
from manager.views import manager
from pubswh.views import pubswh
from metrics.views import metrics
from . import filters  # pylint: disable=C0413

app.register_blueprint(auth)
app.register_blueprint(manager, url_prefix='/manager')
app.register_blueprint(metrics, url_prefix='/metrics')
app.register_blueprint(pubswh)
