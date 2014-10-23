'''
Created on Oct 17, 2014

@author: ayan
'''
from flask.ext.script import Manager, Command
from flask.ext.collect import Collect
from pubs_ui import app


class CollectStaticFiles(Command):
    """
    collects static files
    so Apache can serve them
    """ 
    
    def run(self):
        collect = Collect()
        collect.init_app(app)
        collect.init_script(manager)
        collect.collect(verbose=True)


manager = Manager(app)
manager.add_command('collect', CollectStaticFiles())


if __name__ == '__main__':
    manager.run()