from flask import Flask
from flask.ext.images import Images
from flask_mail import Mail
#from jinja2 import Environment
from pubs_ui.custom_filters import display_publication_info


app = Flask(__name__)
images = Images(app)
mail = Mail(app)
app.config.from_object('settings')
app.jinja_env.filters['display_pub_info'] = display_publication_info


import PubsFlask