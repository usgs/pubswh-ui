'''
Created on Oct 28, 2014

@author: ayan
'''
from unittest import TestCase
import flask
import httpretty
from settings import BASE_SEARCH_URL
from pubs_ui import app


class TestIndex(TestCase):
    
    def setUp(self):
        
        self.index_url = '/'
        
    def test_index_page_resp(self):
        
        with app.test_client() as c:
            response = c.get(self.index_url)
        status_code = response.status_code
        self.assertEqual(status_code, 200)
        

class TestApiWebArgsSearch(TestCase):
    
    def setUp(self):
        
        self.search_url = '/search?q=state_name'
        self.api_search = BASE_SEARCH_URL
    
    def test_api_webargs_url(self):
        
        with app.test_request_context(self.search_url):
            query_param = flask.request.args['q']
        self.assertEqual(query_param, 'state_name')
    
    @httpretty.activate 
    def test_api_webargs_page_responds(self):
        """
        Create a mock backend service and then
        execute the test.
        """
        httpretty.register_uri(httpretty.GET,
                       self.api_search,
                       content_type='application/json',
                       status=503
                       )
        with app.test_client() as c:
            response = c.get(self.search_url)
        status_code = response.status_code
        self.assertEqual(status_code, 200)
        

class TestContactPage(TestCase):
    
    def setUp(self):
        
        self.contact_url = '/contact'
        
    def test_contact_page_responds(self):
        
        with app.test_client() as c:
            response = c.get(self.contact_url)
        status_code = response.status_code
        self.assertEqual(status_code, 200)
        
    def test_contact_post_data(self):
        
        # contact form doesn't seem to do any thing with the data...
        
        pass