
from flask import Blueprint, render_template
from flask_login import login_required
from oauth2client.service_account import ServiceAccountCredentials

from .. import app

metrics = Blueprint('metrics', __name__,
                    template_folder='templates',
                    static_folder='static',
                    static_url_path='/metrics/static')


def get_access_token():
    return ServiceAccountCredentials.from_json_keyfile_name(
      app.config.get('GA_KEY_FILE_PATH'),
      app.config.get('GA_OAUTH2_SCOPE')).get_access_token().access_token


@metrics.context_processor
def add_ga_access_token():
    return {
        'ga_access_token' : get_access_token(),
    }

@metrics.route('/publications/acquisitions/')
@login_required
def publications_aquisitions():
    return render_template('metrics/publications_aquisitions.html')

@metrics.route('/publications/')
@login_required
def publications():
    return render_template('metrics/publications.html')

