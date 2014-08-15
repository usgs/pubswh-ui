from flask import Flask, render_template, abort
from jinja2 import TemplateNotFound
from requests import get

app = Flask(__name__)



baseApiUrl = "http://localhost:5001"


@app.route('/')
def index():
    return 'index'


#will lead to the rendered HTML for the object
@app.route('/publication/<indexId>')
def publication(indexId):
    r = get(baseApiUrl+'/publication/'+indexId)
    pubreturn = r.json()
    pubdata= pubreturn['pub']
    return render_template('publication.html', indexID=indexId, pubdata=pubdata)



if __name__ == '__main__':
    app.debug = True
    #app.run()
    app.run(port=5000)

