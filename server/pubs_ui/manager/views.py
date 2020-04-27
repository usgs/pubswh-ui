"""
Manager blueprint views
"""
# pylint: disable=C0103,C0111

from authlib.integrations.requests_client import OAuth2Session
from requests import Request, Session

from flask import Blueprint, render_template, request, Response

from ..auth.views import authentication_required, get_auth_header, is_authenticated
from .. import app


SERVICES_ENDPOINT = app.config['PUB_URL']
# should requests verify the certificates for ssl connections
VERIFY_CERT = app.config['VERIFY_CERT']

manager = Blueprint('manager', __name__,
                    template_folder='templates',
                    static_folder='static')


@manager.route('/')
@authentication_required
def show_app(path=None):
    return render_template('manager/manager.html')


@manager.route('/services/<op1>', methods=['GET', 'POST', 'PUT', 'DELETE'])
@manager.route('/services/<op1>/<op2>', methods=['GET', 'POST', 'PUT', 'DELETE'])
@manager.route('/services/<op1>/<op2>/<op3>', methods=['GET', 'POST', 'PUT', 'DELETE'])
@manager.route('/services/<op1>/<op2>/<op3>/<op4>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def services_proxy(op1, op2=None, op3=None, op4=None):
    """
    View for proxying service calls
    """
    url = '%s%s/' % (SERVICES_ENDPOINT, op1)
    if op2 is not None:
        url = url + op2
    if op3 is not None:
        url = url + '/' + op3
    if op4 is not None:
        url = url + '/' + op4

    headers = {}
    new_token = None
    if not is_authenticated():
        # Retrieve refresh token and ask for a new access token.
        oauth_session = OAuth2Session(client_id=app.config['PUBSAUTH_CLIENT_ID'],
                                     client_secret=app.config['PUBSAUTH_CLIENT_SECRET'],
                                     authorization_endpoint=app.config['PUBSAUTH_AUTHORIZE_URL'],
                                     token_endpoint=app.config['PUBSAUTH_ACCESS_TOKEN_URL'])
        refresh_token = request.cookies.get('refresh_token')

        new_token = oauth_session.refresh_token(app.config['PUBSAUTH_ACCESS_TOKEN_URL'], refresh_token=refresh_token)
        headers['Authorization'] = 'Bearer {0}'.format(new_token.get('access_token'))
    else:
        headers = get_auth_header()
    headers.update(request.headers)

    query_string = request.query_string.decode('utf-8')
    app.logger.info('Service URL is %s?%s', url, query_string)
    # Setting the query_string in the url. If we use params set to request.args, params that are repeated
    # in the query_string do not get encoded. Instead only the first one does.
    proxy_request = Request(method=request.method,
                            url='%s?%s' %(url, query_string),
                            headers=headers,
                            data=request.data)
    proxy_resp = Session().send(proxy_request.prepare(), verify=VERIFY_CERT)
    # This fixed an an ERR_INVALID_CHUNKED_ENCODING when the app was run on the deployment server.
    if 'transfer-encoding' in proxy_resp.headers:
        del proxy_resp.headers['transfer-encoding']

    resp = Response(proxy_resp.text, proxy_resp.status_code, list(proxy_resp.headers.items()))
    if new_token:
        # Update the access_token cookie
        resp.set_cookie('access_token', new_token.get('access_token'), secure=app.config['SECURE_COOKIES'])

    return resp


@manager.errorhandler(404)
def page_not_found(e):
    """
    Returns 404 (not found) status code and 404.html template.
    """
    return render_template('manager/404.html'), 404
