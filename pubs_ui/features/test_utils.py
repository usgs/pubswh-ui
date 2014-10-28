import unittest
import httpretty
#from pubs_ui import utils
import utils

class Utilities_Test(unittest.TestCase):
    
    def test_call_api(self):


        httpretty.register_uri(httpretty.GET, "http://test_url/test",
                                             body = '[{"title":"Test:}]',
                                             content_type="application/json")

        utils.call_api("http://test_url/test")
