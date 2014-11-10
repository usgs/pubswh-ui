from flask import Flask
from flask.ext.images import Images

app = Flask(__name__)
images = Images(app)
app.config.from_object('settings')


import PubsFlask