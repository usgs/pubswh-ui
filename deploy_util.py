'''
Created on Dec 18, 2014

@author: ayan
'''
import arrow


def report_current_utc_time():
    utc_time = arrow.utcnow()
    utc_time_str = utc_time.format('MM/DD/YYYY HH:mm:ss ZZ')
    return utc_time_str


def write_py_file(outfile='deploy_date.py'):
    utc_time = report_current_utc_time()
    with open(outfile, 'w') as py_file:
        deploy_time_var = "DEPLOYED = '{utc_time}'".format(utc_time=utc_time)
        py_file.write(deploy_time_var)
        
        
if __name__ == '__main__':
    
    write_py_file()