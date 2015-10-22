

from flask.ext.testing import TestCase
from pubs_ui import app
from pubs_ui.utils import get_url_endpoint, is_safe_url

class GetUrlEndpoingTestCase(TestCase):
    '''
    Cheating somewhat here by using url_map loaded by app. This makes the tests dependent on pubswh blueprint
    '''

    def create_app(self):
        app.config['TESTING'] = False
        app.config['WSGI_STR'] = '/wsgi/test'
        return app

    def test_with_default_wsgi_str(self):
        self.assertEqual(get_url_endpoint('/contact', 'pubswh:index'), 'pubswh.contact')
        self.assertEqual(get_url_endpoint('/wsgi/test/contact', 'pubswh.index'), 'pubswh.contact')

    def test_with_user_wsgi_str(self):
        self.assertEqual(get_url_endpoint('/wsgi/test2/contact', 'pubswh.index', '/wsgi/test2'), 'pubswh.contact')

    def test_fallback(self):
        self.assertEqual(get_url_endpoint('/nonsense', 'pubswh.index'), 'pubswh.index')


class IsSafeUrl(TestCase):

    def create_app(self):
        app.config['TESTING'] = False
        return app

    def test_good_url(self):
        self.assertTrue(is_safe_url('/junk', 'http://thisserver.com'))
        self.assertTrue(is_safe_url('http://thisserver.com/junk', 'http://thisserver.com'))

    def test_bad_url(self):
        self.assertFalse(is_safe_url('http://thatserver.com/junk', 'http://thisserver.com'))