from flask import Blueprint

mypubs = Blueprint('manage', __name__, template_folder='templates', static='static')

@mypubs.route('/')
def show_mypubs():
    render_template('mypubs_home')