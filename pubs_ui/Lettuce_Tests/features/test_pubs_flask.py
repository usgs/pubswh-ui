import flask
import httpretty
from . import app
from lettuce import *

world.api_search = 'https://pubs-fake.er.usgs.gov/pubs-services/publication/'

@step(r'I have a mock json')
def create_first_mock(step):
    httpretty.enable()
    httpretty.register_uri(httpretty.GET, world.api_search,
                           content_type='application/json',
                           status=503)
    
@step('I get the response code with the app')
def app_call(step):
    with app.test_client() as c:
        response = c.get('/')
        status_code = response.status_code
