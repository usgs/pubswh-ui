'''
Created on Oct 17, 2014

@author: ayan
'''
from flask.ext.script import Manager, Command
from flask.ext.collect import Collect
import arrow
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
    
    def report_current_utc_time(self):
        utc_time = arrow.utcnow()
        utc_time_str = utc_time.format('MMMM DD, YYYY HH:mm:ss ZZ')
        return utc_time_str
    
    def write_py_file(self, outfile='deploy_date.py'):
        utc_time = self.report_current_utc_time()
        with open(outfile, 'w') as py_file:
            deploy_time_var = "DEPLOYED = '{utc_time}'".format(utc_time=utc_time) 
            py_file.write(deploy_time_var)
            
    def run(self):
        self.write_py_file()


manager = Manager(application)
manager.add_command('collect', CollectStaticFiles())
manager.add_command('date_report', ReportDeployDate())


if __name__ == '__main__':
    manager.run()