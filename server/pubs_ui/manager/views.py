"""
Manager blueprint views
"""
# pylint: disable=C0103,C0111

from requests import Request, Session

from flask import Blueprint, render_template, request

from ..auth.views import authentication_required, get_auth_header
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
@authentication_required
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
    resp = Session().send(proxy_request.prepare(), verify=VERIFY_CERT)
    # This fixed an an ERR_INVALID_CHUNKED_ENCODING when the app was run on the deployment server.
    if 'transfer-encoding' in resp.headers:
        del resp.headers['transfer-encoding']

    return (resp.text, resp.status_code, list(resp.headers.items()))


@manager.errorhandler(404)
def page_not_found(e):
    """
    Returns 404 (not found) status code and 404.html template.
    """
    return render_template('manager/404.html'), 404
