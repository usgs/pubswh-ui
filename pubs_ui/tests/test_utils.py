'''
Created on Oct 23, 2014

@author: ayan

These tests should be run through the test runner via "nosetests".
'''
import json
import httpretty
from unittest import TestCase
from settings import BASE_SEARCH_URL
from ..utils import SearchPublications, make_contributor_list


class TestMakeContributorList(TestCase):
    """
    Test the make_contributor_list function
    """
    
    def setUp(self):
        
        self.authors = {'authors': [
                                    {'given': 'apple', 'family': 'orange', 'rank': 1, 'corporation': False},
                                    {'given': 'mango', 'family': 'grape', 'rank': 2, 'corporation': False}
                                    ]
                        }
        self.organization = {'authors': [
                                         {'corporation': True, 'organization': 'A Local Government Agency', 'rank': 1},
                                         {'corporation': True, 'organization': 'Another Local Agency', 'rank': 2}
                                         ]
                             }
        self.mixed = {'authors': [
                                  {'given': 'apple', 'family': 'orange', 'rank': 1, 'corporation': False},
                                  {'corporation': True, 'organization': 'A Local Government Agency', 'rank': 2},
                                  {'given': 'mango', 'family': 'grape', 'rank': 2, 'corporation': False}
                                  ]
                      }
        
    def test_make_contributors_list_no_corporation(self):
        
        result = make_contributor_list(self.authors['authors'])
        expected = ['apple orange', 'mango grape']
        self.assertEqual(result, expected)
        
    def test_make_contributions_list_corporation(self):
        
        result = make_contributor_list(self.organization['authors'])
        expected = ['A Local Government Agency', 'Another Local Agency']
        self.assertEqual(result, expected)
        
    def test_make_contributions_mixed(self):
        
        result = make_contributor_list(self.mixed['authors'])
        expected = ['apple orange', 'A Local Government Agency', 'mango grape']
        self.assertEqual(result, expected)


class TestSearchPublications(TestCase):
    
    def setUp(self):
        
        self.search_url = BASE_SEARCH_URL
        self.sp = SearchPublications(self.search_url)
        self.test_params = {'q': 'some_state'}
        self.resp_data = {'records': [{'authors': [{'given': 'apple', 'family': 'orange', 'rank': 1, 'corporation': False},], 'series_number': '18301'}]}
        
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
        result = self.sp.get_pubs_search_results(self.test_params)
        response_content, status_code = result
        expected_return_content = {'records': [{'authorList': ['apple orange'], 'authors': [{'given': 'apple', 'family': 'orange', 'rank': 1, 'corporation': False},], 'series_number': '18301'}]}
        self.assertEqual(status_code, 200)
        self.assertEqual(response_content, expected_return_content)

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
        result = self.sp.get_pubs_search_results(self.test_params)
        response_content, status_code = result
        self.assertEqual(status_code, 503)
        self.assertIsNone(response_content)