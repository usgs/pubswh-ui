import argparse
from pubs_ui import app as application

# pylint: disable=C0103

if __name__ == '__main__':
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', '-ht', type=str)
    parser.add_argument('--port', '-p', type=int)
    args = parser.parse_args()
    host = args.host if args.host is not None else 'localhost'
    port = args.port if args.port is not None else '5050'

    application.run(host=host, port=port, threaded=True)

    # run from the command line as follows
    # python run.py --host <ip address of your choice> --port <port of your choice>