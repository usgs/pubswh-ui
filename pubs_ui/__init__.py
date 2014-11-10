from flask import Flask
from flask.ext.images import Images
#from jinja2 import Environment
from pubs_ui.custom_filters import get_publication_type


app = Flask(__name__)
images = Images(app)
app.config.from_object('settings')
app.jinja_env.filters['getpubtype'] = get_publication_type


import PubsFlask