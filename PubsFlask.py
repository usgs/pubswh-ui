from flask import Flask, render_template, jsonify, abort, url_for, request
from webargs import Arg
from webargs.flaskparser import use_args, FlaskParser
from Stubdata import pubs, pubSubtypes, costCenters

app = Flask(__name__)

search_args = {
    'title': Arg(str, multiple=True),
    'author': Arg(str, multiple=True),
    'year': Arg(str, multiple=True),
    'abstract': Arg(str, multiple=True)
}

#url_for('static', filename='_thumb_15050.png')



@app.route('/')
def index():
    return 'index'


#making a tiny API for the app to call
@app.route('/api/v1/pubs', methods=['GET'])
def get_pubs():
    return jsonify({'pubs': pubs})


@app.route('/api/v1/pubs/<indexId>', methods=['GET'])
def get_pub(indexId):
    pub = filter(lambda t: t['indexId'] == indexId, pubs)
    if len(pub) == 0:
        abort(404)
    return jsonify({'pub': pub[0]})

#will lead to the rendered HTML for the object
@app.route('/publication/<indexId>')
def publication(indexId):
    pub = filter(lambda t: t['indexId'] == indexId, pubs)
    if len(pub) == 0:
        abort(404)
    pubdata= pub[0]
    print pubdata['title']
    return render_template('publication.html', indexID=indexId, pubdata=pub[0])


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
    app.run()

