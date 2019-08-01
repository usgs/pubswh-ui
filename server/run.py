import argparse
from pubs_ui import app as application


if __name__ == '__main__':
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', '-ht', type=str)
    parser.add_argument('--port', '-p', type=int)
    args = parser.parse_args()
    host_val = args.host
    if host_val is not None:
        host = host_val
    else:
        host = 'localhost'

    if args.port is None:
        port = 5050
    else:
        port = args.port
    application.run(host=host, port=port, threaded=True)
    # run from the command line as follows
    # python runserver.py -ht <ip address of your choice>