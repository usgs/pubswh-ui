from flask import Flask
from flask.ext.images import Images
from flask_mail import Mail
from pubs_ui.custom_filters import display_publication_info


app = Flask(__name__)
app.config.from_object('settings') # load configuration before passing the app object to other things
images = Images(app)
mail = Mail(app)
app.jinja_env.filters['display_pub_info'] = display_publication_info
app.jinja_env.globals.update(wsgi_str=app.config['WSGI_STR'])
app.jinja_env.globals.update(GOOGLE_ANALYTICS_CODE=app.config['GOOGLE_ANALYTICS_CODE'])



import PubsFlask