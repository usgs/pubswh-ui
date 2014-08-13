from flask import Flask, url_for, render_template, jsonify, abort

app = Flask(__name__)

pubs = [
    {
        "id": 2,
        "title": "title",
        "abstract": "the abstract",
        "language": "language",
        "publisher": "publisher",
        "collaboration": "collaboration",
        "links": [],
        "notes": "some notes",
        "contact": {"id": 1},
        "indexId": "2",
        "displayToPublicDate": "2014-07-22T20:06:10.000",
        "publicationType": {"id": 18},
        "publicationSubtype": {"id": 5},
        "seriesTitle": {"id": 331},
        "seriesNumber": "series number",
        "subseriesTitle": "subseries title",
        "chapter": "chapter",
        "subchapterNumber": "subchapter title",
        "publisherLocation": "publicsher location",
        "doi": "doi",
        "issn": "issn",
        "isbn": "isbn",
        "usgsCitation": "usgs citation",
        "productDescription": "product description",
        "startPage": "start",
        "endPage": "end",
        "numberOfPages": "1",
        "onlineOnly": "N",
        "additionalOnlineFiles": "Y",
        "temporalStart": "2014-07-14T12:00:00",
        "temporalEnd": "2014-07-20T12:00:00",
        "ipdsId": "ipdsid",
        "authors": [],
        "editors": [],
        "costCenters": []
    }
    ]

#url_for('static', filename='style.css')

@app.route('/')
def index():
    return 'index'

#making a tiny API for the app to call
@app.route('/api/v1/pubs', methods = ['GET'])
def get_pubs():
    return jsonify( { 'pubs': pubs } )

@app.route('/api/v1/pubs/<indexId>', methods = ['GET'])
def get_pub(indexId):
    pub = filter(lambda t:t['indexId'] == indexId, pubs)
    if len(pub) == 0:
        abort(404)
    return jsonify( { 'pub': pub[0] } )

@app.route('/publication/<indexID>')
def publication(indexID):
    return render_template('publication.html',indexID=indexID)

if __name__ == '__main__':
    app.debug = True
    app.run()

