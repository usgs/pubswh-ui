
from flask import Blueprint, render_template
from flask_login import login_required
from httplib2 import Http
from oauth2client.service_account import ServiceAccountCredentials

from .. import app

metrics = Blueprint('metrics', __name__,
                    template_folder='templates',
                    static_folder='static',
                    static_url_path='/metrics/static')


def get_access_token():
    # verification_cert could be a boolean or a string representing a path to a certificate bundle
    verification_cert = app.config.get('VERIFY_CERT')
    keyfile_path = app.config.get('GA_KEY_FILE_PATH')
    ga_auth_scope = app.config.get('GA_OAUTH2_SCOPE')
    # if verification_cert is a str that means it's a cert bundle, use that in an Http object
    http = Http(ca_certs=verification_cert) if isinstance(verification_cert, str) else None
    credentials = ServiceAccountCredentials.from_json_keyfile_name(keyfile_path, ga_auth_scope)
    access_token = credentials.get_access_token(http=http).access_token
    return access_token


@metrics.context_processor
def add_ga_access_token():
    return {
        'ga_access_token': get_access_token(),
    }

@metrics.route('/publications/acquisitions/')
@login_required
def publications_aquisitions():
    return render_template('metrics/publications_aquisitions.html')

@metrics.route('/publications/')
@login_required
def publications():
    return render_template('metrics/publications.html')

