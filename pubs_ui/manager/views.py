from flask import Blueprint, render_template
from flask_login import login_required

manager = Blueprint('manager', __name__,
                    template_folder='templates',
                    static_folder='static')


@manager.route('/<path:path>')
@manager.route('/')
@login_required
def show_app(path=None):
    return render_template('manager/manager.html')

@manager.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404