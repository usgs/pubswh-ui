

from flask.ext.testing import TestCase
from pubs_ui import app
from pubs_ui.utils import get_url_rule, is_safe_url

class GetUrlRuleTestCase(TestCase):

    def create_app(self):
        app.config['TESTING'] = False
        app.config['WSGI_STR'] = '/wsgi/test'
        return app

    def test_with_default_wsgi_str(self):
        self.assertEqual(get_url_rule('/junk'), '/junk')
        self.assertEqual(get_url_rule('/wsgi/test/junk'), '/junk')

    def test_with_user_wsgi_str(self):
        self.assertEqual(get_url_rule('/wsgi/test/junk', '/wsgi/test2'), '/wsgi/test/junk')
        self.assertEqual(get_url_rule('/wsgi/test2/junk', '/wsgi/test2'), '/junk')


class IsSafeUrl(TestCase):

    def create_app(self):
        app.config['TESTING'] = False
        return app

    def test_good_url(self):
        self.assertTrue(is_safe_url('/junk', 'http://thisserver.com'))
        self.assertTrue(is_safe_url('http://thisserver.com/junk', 'http://thisserver.com'))

    def test_bad_url(self):
        self.assertFalse(is_safe_url('http://thatserver.com/junk', 'http://thisserver.com'))