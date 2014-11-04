
import json
from flask import render_template, abort, request, Response, jsonify
from requests import get
from webargs.flaskparser import FlaskParser
from flask.ext.paginate import Pagination
from arguments import search_args
from utils import (pubdetails, pull_feed, create_display_links, getbrowsecontent,
                   get_pubs_search_results, contributor_lists)
from forms import ContactForm
from pubs_ui import app
import sys

#set UTF-8 to be default throughout app
reload(sys)
sys.setdefaultencoding("utf-8")


pub_url = app.config['PUB_URL']
lookup_url = app.config['LOOKUP_URL']
supersedes_url = app.config['SUPERSEDES_URL']
browse_url = app.config['BROWSE_URL']
search_url = app.config['BASE_SEARCH_URL']

#should requests verify the certificates for ssl connections
verify_cert = app.config['VERIFY_CERT']
PER_PAGE = 5

@app.route('/')
def index():
    return render_template('home.html')


#contact form
@app.route('/contact', methods=['GET', 'POST'])
def contact():
    form = ContactForm()
    if request.method == 'POST':
        return 'Form posted.'
    elif request.method == 'GET':
        return render_template('contact.html', form=form)


#leads to rendered html for publication page
@app.route('/publication/<indexId>')
def publication(indexId):
    r = get(pub_url+'publication/'+indexId, params={'mimetype': 'json'}, verify=verify_cert)
    pubreturn = r.json()
    pubdata = pubdetails(pubreturn)
    pubdata = create_display_links(pubdata)
    pubdata = contributor_lists(pubdata)
    if 'mimetype' in request.args and request.args.get("mimetype") == 'json':
        return jsonify(pubdata)
    else:
        return render_template('publication.html', indexID=indexId, pubdata=pubdata)


#leads to json for selected endpoints
@app.route('/lookup/<endpoint>')
def lookup(endpoint):
    endpoint_list = ['costcenters', 'publicationtypes', 'publicationsubtypes', 'publicationseries']
    endpoint = endpoint.lower()
    if endpoint in endpoint_list:
        r = get(lookup_url+endpoint, params={'mimetype': 'json'},  verify=verify_cert).json()
        return Response(json.dumps(r),  mimetype='application/json')
    else:
        abort(404)


@app.route('/documentation/faq')
def faq():
    feed_url = 'https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=pubswarehouseinfo&title=myUSGS+4.0+RSS+Feed&labelString=pw_faq&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=600&showContent=true&confirm=Create+RSS+Feed'
    return render_template('faq.html', faq_content=pull_feed(feed_url))


@app.route('/documentation/usgs_series')
def usgs_series():
    feed_url = 'https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=pubswarehouseinfo&title=myUSGS+4.0+RSS+Feed&labelString=usgs_series&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3600&showContent=true&confirm=Create+RSS+Feed'
    return render_template('usgs_series.html', usgs_series_content=pull_feed(feed_url))


@app.route('/documentation/web_service_documentation')
def web_service_docs():
    feed_url = 'https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=pubswarehouseinfo&title=myUSGS+4.0+RSS+Feed&labelString=pubs_webservice_docs&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed'
    return render_template('webservice_docs.html', web_service_docs=pull_feed(feed_url))


@app.route('/documentation/other_resources')
def other_resources():
    feed_url = 'https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=pubswarehouseinfo&title=myUSGS+4.0+RSS+Feed&labelString=other_resources&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed'
    return render_template('other_resources.html', other_resources=pull_feed(feed_url))


@app.route('/browse/', defaults={'path': ''})
@app.route('/browse/<path:path>')
def browse(path):
    browsecontent = getbrowsecontent(browse_url+path)
    return render_template('browse.html', browsecontent=browsecontent)


#this takes advantage of the webargs package, which allows for multiple parameter entries. e.g. year=1981&year=1976
@app.route('/search', methods=['GET'])
def api_webargs():
    parser = FlaskParser()
    search_kwargs = parser.parse(search_args, request)
    per_page = 15
    try:
        page = int(request.args.get('page', 1))
    except ValueError:
        page = 1
    search_kwargs['page_size'] = per_page
    search_kwargs['page_number'] = page
    search_results, resp_status_code = get_pubs_search_results(search_url, params=search_kwargs)
    try:
        search_result_records = search_results['records']
        record_count = search_results['recordCount']
        pagination = Pagination(page=page, total=record_count, per_page=per_page, record_name='Search Results')
        search_service_down = None
    except TypeError:
        search_result_records = None
        pagination = None
        search_service_down = 'The backend services appear to be down with a {0} status.'.format(resp_status_code)
    return render_template('search_results.html', 
                           search_result_records=search_result_records,
                           pagination=pagination,
                           search_service_down=search_service_down
                           )

    # print 'webarg param: ', search_kwargs
    #TODO: map the webargs to the Pubs Warehouse Java API, generate output