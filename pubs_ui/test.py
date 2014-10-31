import utils
import httpretty
from requests import get
import json

httpretty.enable()
test_url = "http://test_url/test/publication/a1"
body = json.loads('{"publicationYear":"1880","publicationType":{"id":18,"text":"Report"}}')
#httpretty.register_uri(httpretty.GET, test_url,body=body)
#r = get(test_url)
print utils.pubdetails(body)

httpretty.disable()
    
