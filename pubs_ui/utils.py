
from urlparse import urlparse, urljoin

from . import app

def get_url_rule(url, wsgi_str=app.config['WSGI_STR']):
    return url.replace(wsgi_str, '')

def is_safe_url(target, host_url):
    ref_url = urlparse(host_url)
    test_url = urlparse(urljoin(host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc