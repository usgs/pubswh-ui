from flask import Blueprint, render_template

manager = Blueprint('manager', __name__,
                    template_folder='templates',
                    static_folder='static')


@manager.route('/<path:path>')
@manager.route('/')
def show_app(path=None):
    return render_template('manager/manager.html')

@manager.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404