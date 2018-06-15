'''
Created on Nov 17, 2014

@author: ayan
'''
# pylint: disable=W0621,W0613,C0111,C0103

import json
from lettuce import world, step
import httpretty
from nose.tools import assert_equal, assert_in
from pubs_ui import app

search_url = app.config['BASE_SEARCH_URL']


#
# Search bar with broken service
#

@step
def i_have_imitated_a_failing_search_service_from_pubs(step):
    world.search_url = search_url
    httpretty.enable()
    httpretty.register_uri(httpretty.GET,
                           world.search_url,
                           content_type='application/json',
                           status=503)


@step
def i_created_a_flask_client_to_test_the_search_with_the_failing_service(step):
    world.client = app.test_client()


@step
def i_access_the_search_url_with_a_simulated_query(step):
    world.pubs_search = '/search?q=state_name'
    with world.client as c:
        response = c.get(world.pubs_search)
    world.response_status_code = response.status_code
    world.expected = 200


@step
def i_should_see_a_200_status_code_from_the_search_page(step):
    httpretty.disable()
    httpretty.reset()
    assert_equal(world.response_status_code, world.expected)


#
# Search bar with working search
#

@step
def i_have_imitated_a_working_search_service_from_pubs_with_fake_data(step):
    world.search_url = search_url
    world.pub_record = {
        'records': [{
            'seriesTitle': {'text': 'Hop on Pop'},
            'publicationYear': '1990',
            'seriesNumber': 41,
            'chapter': 11,
            'subChapter': 2,
            'indexid': '789044',
            'title': 'a title'
        }],
        'recordCount': 1,
        'pageSize': '1',
        'pageRowStart': '0',
        'pageNumber': '1'
    }
    httpretty.enable()
    httpretty.register_uri(httpretty.GET,
                           world.search_url,
                           body=json.dumps(world.pub_record),
                           content_type='application/json',
                           status_code=200)


@step
def i_created_a_flask_client_to_access_the_search_with_the_working_service(step):
    world.client = app.test_client()


@step
def i_access_the_search_url_with_a_simulated_query_string(step):
    world.pubs_search = '/search?q=pop'
    with world.client as c:
        response = c.get(world.pubs_search)
    world.response_content = response.get_data()


@step
def i_should_see_the_fake_content_i_created_in_the_response(step):
    httpretty.disable()
    httpretty.reset()
    assert_in('Hop on Pop', world.response_content)
