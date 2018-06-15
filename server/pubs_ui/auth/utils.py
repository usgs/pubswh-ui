"""
Authorization utilities
"""
from urllib import unquote
from urlparse import urlparse, urljoin

from itsdangerous import BadSignature, BadPayload
from werkzeug.exceptions import NotFound, MethodNotAllowed

from . import login_serializer
from .. import app


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
    app.logger.info('Decoded url %s', unquote(url))
    this_rule = unquote(url).replace(wsgi_str, '')
    app.logger.info('Rule is %s', this_rule)

    try:
        map_adapter = app.url_map.bind(server_name)
        matched_rule = map_adapter.match(this_rule)
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


def get_cida_auth_token(cookies):
    '''
    :param cookies - dictionary of cookies from an http request:
    :return string - the cida auth token contained with the cookies dictionary:
    '''
    token_cookie = cookies.get(app.config['REMEMBER_COOKIE_NAME'], '')
    try:
        session_data = login_serializer.loads(
            token_cookie, max_age=app.config['REMEMBER_COOKIE_DURATION'].total_seconds())
    except (BadSignature, BadPayload):
        token = ''
    else:
        token = session_data[1]

    return token


def generate_auth_header(request):
    '''
    This is used to generate the auth header to make requests back to the pubs-services endpoints
    :param request: the request object to get the cookie
    :return: A dictionary containing the authorization header that can be sent along to the pubs-services endpoint.
    '''
    return {'Authorization': 'Bearer  ' + get_cida_auth_token(request.cookies)}
