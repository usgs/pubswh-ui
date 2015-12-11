
from requests import Request, Session

from flask import Blueprint, render_template, request
from flask_login import login_required

from ..auth.views import generate_auth_header
from .. import app

SERVICES_ENDPOINT = app.config['PUB_URL']
# should requests verify the certificates for ssl connections
VERIFY_CERT = app.config['VERIFY_CERT']


manager = Blueprint('manager', __name__,
                    template_folder='templates',
                    static_folder='static')


@manager.route('/')
@login_required
def show_app(path=None):
    return render_template('manager/manager.html')


@manager.route('/services/<op1>', methods=['GET', 'POST', 'PUT', 'DELETE'])
@manager.route('/services/<op1>/<op2>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def services_proxy(op1, op2=None):
    url = '%s%s/' % (SERVICES_ENDPOINT, op1)
    if op2 != None:
        url = url + op2
    headers = generate_auth_header(request)
    if request.method == 'POST' or request.method == 'PUT' :
        headers.update(request.headers)

    app.logger.info('Service URL is %s' % url)
    proxy_request = Request(method=request.method,
                            url=url,
                            headers=headers,
                            params=request.args,
                            data=request.data)
    resp = Session().send(proxy_request.prepare(), verify=VERIFY_CERT)
    # This fixed an an ERR_INVALID_CHUNKED_ENCODING when the app was run on the deployment server.
    if 'transfer-encoding' in resp.headers:
        del resp.headers['transfer-encoding']

    return (resp.text, resp.status_code, resp.headers.items())


@manager.errorhandler(404)
def page_not_found(e):
    return render_template('manager/404.html'), 404