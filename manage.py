'''
Created on Oct 17, 2014

@author: ayan
'''
from flask.ext.script import Manager, Command
from flask.ext.collect import Collect
from deploy_util import write_py_file
from pubs_ui import app as application


class CollectStaticFiles(Command):
    """
    collects static files
    so Apache can serve them
    """ 
    
    def run(self):
        collect = Collect()
        collect.init_app(application)
        collect.init_script(manager)
        collect.collect(verbose=True)
        
        
class ReportDeployDate(Command):
    """
    Create a file with the
    deploy date
    """
    
    def run(self):
        write_py_file()


manager = Manager(application)
manager.add_command('collect', CollectStaticFiles())
manager.add_command('date_report', ReportDeployDate())


if __name__ == '__main__':
    manager.run()