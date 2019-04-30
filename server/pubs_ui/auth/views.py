
from functools import wraps
import time
from urllib.parse import urlencode

from flask import redirect, url_for, Blueprint, session, request

from .. import app, oauth

auth_blueprint = Blueprint('auth', __name__)  # pylint: disable=C0103

TOKEN_EXPIRES_AT_KEY = 'access_token_expires_at'


def authentication_required(f):
    '''
    View decorator used to decorate any view that requires authorization when the usgs theme is used
    :param function f: view function
    :return: Decorated function
    :rtype: function
    '''
    @wraps(f)
    def decorated_function(*args, **kwargs):
        '''
        Function which redirects to the authorization endpoint if the access token has expired otherwise
        executes the function.
        '''
        if not is_authenticated():
            return redirect('{0}?{1}'.format(url_for('auth.login'), urlencode({'next': request.url})))
        return f(*args, **kwargs)

    return decorated_function

def is_authenticated():
    '''
    Return true if the user is authenticated
    :rtype: bool
    '''

    return session.get(TOKEN_EXPIRES_AT_KEY, 0) > int(time.time())

def get_auth_header():
    '''
    Return the authentication header to be used for proxy calls. If not authenticated an empty dict will be return
    :return: dictionary containing the authentication header
    :rtype: dict
    '''

    access_token = request.cookies.get('access_token')
    header = {}
    if access_token:
        header['Authorization'] = 'Bearer {0}'.format(access_token)

    return header

@app.context_processor
def inject_is_authenticated():
    return dict(is_authenticated=is_authenticated())


@auth_blueprint.route('/login')
def login():
    '''
    Redirects to the authentication's login.
    '''
    redirect_uri = '{0}?next={1}'.format(url_for('auth.authorize', _external=True), request.args.get('next'))

    return oauth.pubsauth.authorize_redirect(redirect_uri)


@auth_blueprint.route('/authorize')
def authorize():
    '''
    Retrieves the access token from the authorization service and sets its value in a cookie.
    :return:
    '''
    token = oauth.pubsauth.authorize_access_token(verify=False)

    response = redirect(request.args.get('next'))
    response.set_cookie('access_token', token.get('access_token'), secure=app.config['SECURE_COOKIES'])
    session['access_token_expires_at'] = token.get('expires_at')

    return response

@auth_blueprint.route('/logout')
def logout():
    '''
    Logouts the user and clears the session data
    :return:
    '''
    # Clear session stored data
    session.clear()

    # Redirect user to logout endpoint
    params = {'redirect_uri': request.args.get('next')}
    return redirect(app.config['PUBSAUTH_API_BASE_URL'] + '/logout?' + urlencode(params))
