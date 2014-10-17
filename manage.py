'''
Created on Oct 17, 2014

@author: ayan
'''
from flask.ext.script import Manager
from flask.ext.collect import Collect
from pubs_ui import app 

manager = Manager()
collect = Collect()
collect.init_app(app)
collect.init_script(manager)