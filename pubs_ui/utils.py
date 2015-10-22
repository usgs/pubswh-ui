
from urlparse import urlparse, urljoin

from . import app

def get_url_endpoint(url, fallback, wsgi_str=None):
    if not wsgi_str:
        wsgi_str = app.config['WSGI_STR']
    this_rule = url.replace(wsgi_str, '')

    for rule in app.url_map.iter_rules():
        if str(rule) == this_rule:
            return rule.endpoint

    return fallback


    return url.replace(wsgi_str, '')

def is_safe_url(target, host_url):
    ref_url = urlparse(host_url)
    test_url = urlparse(urljoin(host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc