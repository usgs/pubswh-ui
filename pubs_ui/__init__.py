import logging
from flask import Flask
from flask.ext.images import Images
from flask_mail import Mail
from pubs_ui.custom_filters import display_publication_info

FORMAT = '%(asctime)s %(message)s'
fmt = logging.Formatter(FORMAT)
handler = logging.FileHandler('pubs_ui.log')
handler.setLevel(logging.INFO)
handler.setFormatter(fmt)
# application.logger.addHandler(handler)


app = Flask(__name__)
app.config.from_object('settings') # load configuration before passing the app object to other things
if app.config['DEBUG']:
    app.logger.addHandler(handler)
images = Images(app)
mail = Mail(app)
app.view_functions['images'] = images.handle_request
app.jinja_env.filters['display_pub_info'] = display_publication_info
app.jinja_env.globals.update(wsgi_str=app.config['WSGI_STR'])

import PubsFlask