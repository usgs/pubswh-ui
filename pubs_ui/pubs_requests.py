'''
Created on Nov 17, 2014

@author: ayan
'''

import requests


SUPERCEDED_URL = 'http://cida-eros-pubsdev.er.usgs.gov:8080/pubs2_ui/service/citation/json/extras?prod_id=ofr78327'
SUPERCEDER_URL = 'http://cida-eros-pubsdev.er.usgs.gov:8080/pubs2_ui/service/citation/json/extras?prod_id=b1501'

superceded_resp = requests.get(SUPERCEDED_URL)
superceded_json = superceded_resp.json()
print(superceded_json)

print('\n')

superceder_resp = requests.get(SUPERCEDER_URL)
superceder_json = superceder_resp.json()
print(superceder_json)