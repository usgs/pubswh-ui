"""
Auth utils tests
"""
from flask_testing import TestCase
from .. import app
from ..utils import get_url_endpoint, is_safe_url

class GetUrlEndpointTestCase(TestCase):
    '''
    Cheating somewhat here by using url_map loaded by app. This makes the tests dependent on pubswh blueprint
    '''

    fallback = ('pubswh:index', {})

    def create_app(self):
        app.config['TESTING'] = False
        app.config['WSGI_STR'] = '/wsgi/test'
        return app

    def test_with_default_wsgi_str(self):
        self.assertEqual(get_url_endpoint('/contact', '127.0.0.1', self.fallback), ('pubswh.contact', {}))
        self.assertEqual(get_url_endpoint('/wsgi/test/contact', '127.0.0.1', self.fallback), ('pubswh.contact', {}))
        self.assertEqual(get_url_endpoint('%2Fwsgi%2Ftest%2Fcontact', '127.0.0.1', self.fallback), ('pubswh.contact', {}))

    def test_with_user_wsgi_str(self):
        self.assertEqual(get_url_endpoint('/wsgi/test2/contact', '127.0.0.1', self.fallback, '/wsgi/test2'), ('pubswh.contact', {}))

    def test_with_parameters(self):
        self.assertEqual(get_url_endpoint('/preview/1234', '127.0.0.1', self.fallback), ('pubswh.restricted_page', {'index_id' : '1234'}))
        self.assertEqual(get_url_endpoint('/wsgi/test/preview/1234', '127.0.0.1', self.fallback), ('pubswh.restricted_page', {'index_id' : '1234'}))


    def test_fallback(self):
        self.assertEqual(get_url_endpoint('/nonsense', '127.0.0.1', self.fallback), self.fallback)


class IsSafeUrl(TestCase):

    def create_app(self):
        app.config['TESTING'] = False
        return app

    def test_good_url(self):
        self.assertTrue(is_safe_url('/junk', 'http://thisserver.com'))
        self.assertTrue(is_safe_url('http://thisserver.com/junk', 'http://thisserver.com'))

    def test_bad_url(self):
        self.assertFalse(is_safe_url('http://thatserver.com/junk', 'http://thisserver.com'))
