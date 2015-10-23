
from urlparse import urlparse, urljoin
from urllib import unquote

from werkzeug.exceptions import NotFound, MethodNotAllowed

from . import app

def get_url_endpoint(url, server_name, fallback, wsgi_str=None):
    '''
    Take the url and return the endpoint and arguments which can then be feed to url_for.
    :param url: string - represents a url fragement
    :param server_name: string - typically you would retrieve this from request.environ['SERVER_NAME']
    :param fallback: tuple (endpoint, arguments dict)
    :param wsgi_str: optional string - The string to remove from url to get the actual url path
    :return: tuple (endpoint, arguments(dict))
    '''
    if not wsgi_str:
        wsgi_str = app.config['WSGI_STR']
    app.logger.info('Decoded url ' + unquote(url))
    this_rule = unquote(url).replace(wsgi_str, '')
    app.logger.info('Rule is ' + this_rule)

    try:
        ma = app.url_map.bind(server_name)
        matched_rule = ma.match(this_rule)
        return matched_rule
    except (NotFound, MethodNotAllowed):
        return fallback


def is_safe_url(target, host_url):
    '''
    Return true if it is safe to redirect to target
    :param target: string - url which is being tested
    :param host_url: string - typically retrieved fromr request.host_url
    :return: bool
    '''
    ref_url = urlparse(host_url)
    test_url = urlparse(urljoin(host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc