from flask import Flask

app = Flask(__name__)
app.config.from_object('settings')
app.jinja_env.globals.update(globals_test='some text')

import PubsFlask