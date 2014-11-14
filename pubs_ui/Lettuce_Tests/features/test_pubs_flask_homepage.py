'''
Created on Nov 13, 2014

@author: ayan
'''
import json
from lettuce import world, step
import httpretty
from nose.tools import assert_equal, assert_true
from pubs_ui import app

search_url = app.config['BASE_SEARCH_URL']

# Homepage responds if service is broken
@step
def i_have_imitated_a_failing_search_service_from_pubs(step):
    world.search_url = search_url
    httpretty.enable()
    httpretty.register_uri(httpretty.GET, 
                           world.search_url, 
                           content_type='application/json', 
                           status=503
                           )
    
@step
def i_created_a_flask_client_to_test_the_homepage_with_the_failing_service(step):
    world.client = app.test_client()
    
@step
def i_access_the_homepage_url_with_the_failing_service_backend(step):
    world.index_url = '/'
    with world.client as c:
        response = c.get(world.index_url)
    world.response_status_code = response.status_code
    world.expected = 200
    
@step
def i_should_see_a_200_status_code_from_the_homepage(step):
    assert_equal(world.response_status_code, world.expected)
    httpretty.disable()
    httpretty.reset()
    
    
# Homepage responds if service is working
@step
def i_have_imitated_a_working_search_service_from_pubs(step):
    world.search_url = search_url
    world.recent_pub = {'records': [
                                    {'seriesTitle': {'text': 'Das Boot'},
                                     'publicationYear': '2021',
                                     'seriesNumber': 14,
                                     'chapter': 18,
                                     'subChapter': 4
                                     }
                                    ]
                        }
    httpretty.enable()
    httpretty.register_uri(httpretty.GET,
                           world.search_url,
                           body=json.dumps(world.recent_pub),
                           content_type='application/json',
                           status_code=200
                           )

@step 
def i_created_a_flask_client_to_test_the_homepage_with_the_working_service(step):
    world.client = app.test_client()
    
@ step
def i_access_the_homepage_url_with_the_working_service(step):
    world.index_url = '/'
    with world.client as c:
        response = c.get(world.index_url)
    world.response_content = response.get_data()
    print(world.response_content)
    
@step
def i_should_see_the_imitated_pubs_content_on_the_page(step):
    title_index = world.response_content.find('Das Boot') # determine if the imitated title is in the page content
    if title_index > -1:
        world.imitated_content_found = True
    else:
        world.imitated_content_found = False
    assert_true(world.imitated_content_found)
    httpretty.disable()
    httpretty.reset()
    
    