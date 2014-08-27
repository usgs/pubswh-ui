

from flask import Flask, jsonify, abort, request
from webargs import Arg
from webargs.flaskparser import use_args, FlaskParser
from Stubdata import pubs, pubSubtypes, costCenters

app = Flask(__name__)


@app.route('/')
def hello_world():
    return "Hey look, it's the backend app!"

search_args = {
    'title': Arg(str, multiple=True),
    'author': Arg(str, multiple=True),
    'year': Arg(str, multiple=True),
    'abstract': Arg(str, multiple=True)
}

#making a tiny API for the app to call
@app.route('/publication', methods=['GET'])
def get_pubs():
    return jsonify({'pubs': pubs})


@app.route('/publication/<indexId>', methods=['GET'])
def get_pub(indexId):
    pub = filter(lambda t: t['indexId'] == indexId, pubs)
    if len(pub) == 0:
        abort(404)
    return jsonify({'pub': pub[0]})

#this is a basic built in flask args tool, where the arguments don't actually have to be described, but then they also
# can't exist more than once, etc
@app.route('/search', methods=['GET'])
def api_hello():
    params = request.args.items()
    print params
    if 'indexID' in request.args:
        indexId = request.args['indexId']
        pub = filter(lambda t: t['indexId'] == indexId, pubs)
        if len(pub) == 0:
            abort(404)
        return jsonify({'pub': pub[0]})
    else:
        return jsonify({'pubs': pubs})


#this takes advantage of the webargs package, which allows for multiple parameter entries. e.g. year=1981&year=1976
@app.route('/searchwebargs', methods=['GET'])
def api_webargs():
    parser = FlaskParser()
    args = parser.parse(search_args, request)

    print 'webarg param: ', args
    #TODO: map the webargs to the Pubs Warehouse Java API, generate output


if __name__ == '__main__':
    app.debug = True
    app.run(port=5001)
