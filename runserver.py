from pubs_ui import app as application
from flask.ext.images import Images

images = Images(application)

if __name__ == '__main__':
    application.run(port=5050)