'''
Created on Oct 23, 2014

@author: ayan

These tests should be run through the test runner via "nosetests".
'''
import json
import httpretty
from unittest import TestCase
from settings import BASE_SEARCH_URL
from ..utils import get_pubs_search_results


class TestGetPubsSearchResults(TestCase):
    
    """
    Test that responses from the 
    search API are handled correctly.
    """
    
    def setUp(self):
        
        self.search_url = BASE_SEARCH_URL
        self.test_params = {'q': 'some_state'}
        self.resp_data = [{u'a': 1, u'b': 2, u'c': 3}]
 
    @httpretty.activate
    def test_response_behavior_with_data(self):
        """
        Simulate a working API
        """
        httpretty.register_uri(httpretty.GET, 
                               self.search_url,
                               body=str(json.dumps(self.resp_data)),
                               content_type='application/json',
                               status=200
                               )
        result = get_pubs_search_results(self.search_url, self.test_params)
        response_content, status_code = result
        self.assertEquals(status_code, 200)
        self.assertEquals(response_content, self.resp_data)
        
    @httpretty.activate
    def test_response_behavior_with_down_service(self):
        """
        Simulate a down API
        """
        httpretty.register_uri(httpretty.GET,
                               self.search_url,
                               content_type='application/json',
                               status=503
                               )
        result = get_pubs_search_results(self.search_url, self.test_params)
        response_content, status_code = result
        self.assertEquals(status_code, 503)
        self.assertIsNone(response_content)