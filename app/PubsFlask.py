
from flask import Flask, render_template, abort, request, jsonify
from requests import get
from webargs import Arg
from webargs.flaskparser import FlaskParser

from Stubdata import pubs

app = Flask(__name__)

stubbed = True
baseApiUrl = "http://127.0.0.1:5000/api"

def Getdata(indexId):
    if stubbed == True:
        pub = filter(lambda t: t['indexId'] == indexId, pubs)
        pubreturn = {'pub': pub[0]}

    else:
        r = get(baseApiUrl+'/publication/'+indexId)
        pubreturn = r.json()
    return pubreturn





search_args = {
    'title': Arg(str, multiple=True),
    'author': Arg(str, multiple=True),
    'year': Arg(str, multiple=True),
    'abstract': Arg(str, multiple=True)
}

@app.route('/')
def index():
    return ' this is the index'



#will lead to the rendered HTML for the object
@app.route('/publication/<indexId>')
def publication(indexId):
    pubreturn = Getdata(indexId)
    pubdata= pubreturn['pub']
    return render_template('publication.html', indexID=indexId, pubdata=pubdata)

@app.route('/api/publication', methods=['GET'])
def get_pubs():
    return jsonify({'pubs': pubs})

@app.route('/api/publication/<indexId>', methods=['GET'])
def get_pub(indexId):
    pub = filter(lambda t: t['indexId'] == indexId, pubs)
    if len(pub) == 0:
        abort(404)
    return jsonify({'pub': pub[0]})

#this is a basic built in flask args tool, where the arguments don't actually have to be described, but then they also
# can't exist more than once, etc
@app.route('/api/search', methods=['GET'])
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
@app.route('/api/searchwebargs', methods=['GET'])
def api_webargs():
    parser = FlaskParser()
    args = parser.parse(search_args, request)

    print 'webarg param: ', args
    #TODO: map the webargs to the Pubs Warehouse Java API, generate output


if __name__ == '__main__':
    app.debug = True
    #app.run()
    app.run(port=5000)