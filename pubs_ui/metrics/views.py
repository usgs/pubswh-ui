import random
import time

from flask import Blueprint, render_template, request, jsonify, Response
from flask_login import login_required

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from httplib2 import Http
from oauth2client.service_account import ServiceAccountCredentials

from .. import app, cache


metrics = Blueprint('metrics', __name__,
                    template_folder='templates',
                    static_folder='static',
                    static_url_path='/metrics/static')

verification_cert = app.config.get('VERIFY_CERT', True)
try:
    credentials = ServiceAccountCredentials.from_json_keyfile_name(
          app.config.get('GA_KEY_FILE_PATH'),
          app.config.get('GA_OAUTH2_SCOPE'))
    analytics = build('analytics', 'v4', http=credentials.authorize(Http()), discoveryServiceUrl=app.config.get('GA_DISCOVERY_URI'))
except IOError:
    credentials = None

def get_access_token():
    if isinstance(verification_cert, str):
        http = Http(ca_certs=verification_cert)
    elif isinstance(verification_cert, bool):
        # if VERIFY_CERT is False, that means that disable_ssl_certificate_validation should be True and vice versa
        http = Http(disable_ssl_certificate_validation=(not verification_cert))
    else:
        http = None

    return credentials.get_access_token(http).access_token


def make_cache_key_from_request_data():
    return request.data


@metrics.route('/publications/acquisitions/')
@login_required
def publications_aquisitions():
    return render_template('metrics/publications_aquisitions.html', ga_access_token=get_access_token())


@metrics.route('/publications/')
@login_required
def publications():
    return render_template('metrics/publications.html', ga_access_token=get_access_token())


@metrics.route('/publication/<pubsid>/')
def publication(pubsid):
    return render_template('metrics/publication.html', pubsid=pubsid)


@metrics.route('/gadata/', methods=['POST'])
@cache.cached(86400, make_cache_key_from_request_data)
def gadata():
    view_id = app.config.get('GA_PUBS_VIEW_ID')
    report_requests = request.get_json()
    [r.update({'viewId': view_id}) for r in report_requests]
    for n in range(0, 5):
        try:
            report_response = analytics.reports().batchGet(
                quotaUser=request.remote_addr,  # Pass so that the quota to limit 10 queries per second per IP uses the client's IP.
                body={
                    'reportRequests': report_requests
                }
            ).execute()
            response = jsonify(report_response)

            break
        except HttpError as error:
            response = Response(response=error.content,
                                status=int(error.resp['status']),
                                mimetype='application/json')
            if error.resp.reason in [
                'userRateLimitExceeded',
                'rateLimitExceeded'
                'quotaExceeded']:
                # Assign a response but try again until succeeds or loop exits
                response = Response
                time.sleep((2 ** n) + random.random())
            else:
                break

    return response





