import json
import httpretty
from lettuce import *
from nose.tools import assert_equal
from utils import SearchPublications, make_contributor_list

@step(r'we have imitated the authors data we would see from pubs')
def make_lists(step):
        world.authors = {'authors': [
                                    {'given': 'apple', 'family': 'orange', 'rank': 1, 'corporation': False},
                                    {'given': 'mango', 'family': 'grape', 'rank': 2, 'corporation': False}
                                    ]
                        }
        world.organization = {'authors': [
                                         {'corporation': True, 'organization': 'A Local Government Agency', 'rank': 1},
                                         {'corporation': True, 'organization': 'Another Local Agency', 'rank': 2}
                                         ]
                             }
        world.mixed = {'authors': [
                                  {'given': 'apple', 'family': 'orange', 'rank': 1, 'corporation': False},
                                  {'corporation': True, 'organization': 'A Local Government Agency', 'rank': 2},
                                  {'given': 'mango', 'family': 'grape', 'rank': 2, 'corporation': False}
                                  ]
                      }
@step(r'I make a list with only authors')
def authors_list(step):
    world.result = make_contributor_list(world.authors['authors'])
    world.expected = ['apple orange', 'mango grape']
    
@step(r'I see that the list was made correctly')
def test_list(step):
    assert_equal(world.result, world.expected)

@step(r'I make a list with only organizations')
def organizations_list(step):
    world.result = make_contributor_list(world.organization['authors'])
    world.expected = ['A Local Government Agency', 'Another Local Agency']
    
@step(r'I make a list with both authors and organizations')
def mixed_list(step):
    world.result = make_contributor_list(world.mixed['authors'])
    world.expected = ['apple orange', 'A Local Government Agency', 'mango grape']

@step(r'we have created a fake url and mocked pubs responses')
def imitation_pubs(step):
        
        world.search_url = 'https://pubs-fake.er.usgs.gov/pubs-services/publication/'
        resp_data = {'records': [{'authors': [{'given': 'apple', 'family': 'orange', 'rank': 1, 'corporation': False},], 'series_number': '18301'}]}

        httpretty.enable()
        httpretty.register_uri(httpretty.GET, 
                       world.search_url,
                       body=str(json.dumps(resp_data)),
                       content_type='application/json',
                       status=200
                       )

@step(r'I search through the publications')
def search_pubs(step):
        test_params = {'q': 'some_state'}
        world.response = SearchPublications(world.search_url).get_pubs_search_results(test_params)
        world.expected_return_content = {'records': [{'authorList': ['apple orange'], 'authors': [{'given': 'apple', 'family': 'orange', 'rank': 1, 'corporation': False},], 'series_number': '18301'}]}
        world.expected_status_code = 200
     
@step(r'I am given the appropriate responses')
def check_responses(step):
        response_content, status_code = world.response
        assert_equal(status_code, world.expected_status_code)
        assert_equal(response_content, world.expected_return_content)

        httpretty.disable()
        httpretty.reset()

@step(r'we have created a fake url and mocked a down service')
def imitation_fail(step):
        httpretty.enable()
        httpretty.register_uri(httpretty.GET,
                               world.search_url,
                               content_type='application/json',
                               status=503
                               )
        
@step(r'I search through the failed service')
def search_nothing(step):
        test_params = {'q': 'some_state'}
        world.response = SearchPublications(world.search_url).get_pubs_search_results(test_params)
        world.expected_return_content = None
        world.expected_status_code = 503
        
