import httpretty
from lettuce import *
from nose.tools import assert_equal
import flask
from pubs_ui import app


@step(r'I have a mock json')
def create_first_mock(step):
    world.api_search = 'https://pubs-fake.er.usgs.gov/pubs-services/publication/'
    httpretty.enable()
    httpretty.register_uri(httpretty.GET, world.api_search,
                           content_type='application/json',
                           status=503)
    
@step(r'I get the response code with the app')
def app_call(step):
    with app.test_client() as c:
        response = c.get('/')
        world.status_code = response.status_code

@step(r'I find the status code I expect')
def asset_status(step):
    assert_equal(world.status_code, 200)
    httpretty.reset()
    httpretty.disable

@step(r'I have state_name query to search')
def set_query_uri(step):
    world.search_url = '/search?q=state_name'

@step(r'I request context from the app')
def con_text(step):
    with app.test_request_context(world.search_url):
        world.query_param = flask.request.args['q']

@step(r'I am given state_name as the query parameter')
def test_param(step):
    assert_equal(world.query_param, 'state_name')

@step(r'I get the query response code')
def query_call(step):
    with app.test_client() as c:
        response = c.get(world.search_url)
    world.status_code = response.status_code

@step(r'Given I have a contact url')
def contact_url(step):
    world.contact_url = '/contact'

@step(r'I look for a response from the app')
def contact_call(step):
    with app.test_client() as c:
        response = c.get(world.contact_url)
        world.status_code = response.status_code
