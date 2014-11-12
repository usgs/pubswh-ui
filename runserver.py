# import logging
from pubs_ui import app as application


if __name__ == '__main__':
    """
    # set-up some very simple logging for local development
    FORMAT = '%(asctime)s %(message)s'
    fmt = logging.Formatter(FORMAT)
    handler = logging.FileHandler('pubs_ui.log')
    handler.setLevel(logging.INFO)
    handler.setFormatter(fmt)
    application.logger.addHandler(handler)
    """
    application.run(port=5050)