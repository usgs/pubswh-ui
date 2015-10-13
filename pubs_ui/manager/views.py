from flask import Blueprint, render_template

manager = Blueprint('manager', __name__,
                    template_folder='templates',
                    static_folder='static')
@manager.route('/')
def show_search():
    return render_template('manager/search.html')

@manager.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404