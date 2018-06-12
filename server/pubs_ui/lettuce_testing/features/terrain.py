"""
Created on Nov 14, 2014

@author: ayan

File for general hacking in lettuce tests
"""

from lettuce import before, after
from coverage import coverage

cov = coverage()


@before.all
def prepare_coverage():
    cov.start()


@after.all
def collect_coverage(total_results):
    cov.stop()
    cov.xml_report(outfile='coverage.xml', include=['pubs_ui/*'])
    scenarios_ran = total_results.scenarios_ran
    scenarios_passed = total_results.scenarios_passed
    message = '{0} scenarios were run, {1} passed'.format(scenarios_ran, scenarios_passed)
    print(message)