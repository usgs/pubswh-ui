from flask import Flask, render_template, jsonify, abort, url_for, request
from Stubdata import pubs, pubSubtypes, costCenters

app = Flask(__name__)



#url_for('static', filename='_thumb_15050.png')



@app.route('/')
def index():
    return 'index'


#will lead to the rendered HTML for the object
@app.route('/publication/<indexId>')
def publication(indexId):
    pub = filter(lambda t: t['indexId'] == indexId, pubs)
    if len(pub) == 0:
        abort(404)
    pubdata= pub[0]
    print pubdata['title']
    return render_template('publication.html', indexID=indexId, pubdata=pub[0])



if __name__ == '__main__':
    app.debug = True
    app.run()

