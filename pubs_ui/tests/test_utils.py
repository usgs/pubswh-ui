'''
Created on Oct 23, 2014

@author: ayan
'''
import json
import httpretty
from unittest import TestCase
from ..utils import get_pubs_search_results


class TestGetPubsSearchResults(TestCase):
    
    """
    Test that responses are handled correctly.
    Httpretty will also check that the URL is valid,
    to prevent surprises from API changes.
    """
    
    def setUp(self):
        
        self.search_url = 'https://pubs-test.er.usgs.gov/pubs-services/publication/'
        self.test_params = {'q': 'some_state'}
        self.resp_data = [{u'a': 1, u'b': 2, u'c': 3}]
 
    @httpretty.activate
    def test_response_behavior_with_data(self):
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
        httpretty.register_uri(httpretty.GET,
                               self.search_url,
                               content_type='application/json',
                               status=503)
        result = get_pubs_search_results(self.search_url, self.test_params)
        response_content, status_code = result
        self.assertEquals(status_code, 503)
        self.assertEquals(response_content, None)


'''
class TestGetPubsSearchResults(TestCase):
    
    def setUp(self):
        
        self.search_url = 'https://pubs-fake.er.usgs.gov/pubs-services/publication/'
        self.test_params = {'q': 'some_state'}
        self.resp_data = json.dumps({'a': 1, 'b': 2, 'c': 3})
    
    @patch('pubs_ui.utils.requests')
    def test_requests_call(self, mock_requests):
        mock_requests.get.return_value.status_code = 200
        mock_requests = HttpResponse(self.resp_data)
        result = get_pubs_search_results(self.search_url, self.test_params)
        content, result_status_code = result
        self.assertEqual(result_status_code, 200)
        
    @patch('pubs_ui.utils.requests')
    def test_pubs_service_down(self, mock_requests):
        mock_requests.get.return_value.status_code = 503
'''