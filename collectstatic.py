'''
Created on Oct 20, 2014

@author: ayan
'''
from flask.ext.collect import Collect
from pubs_ui import app

collect = Collect()
collect.init_app(app)