import sys
import json
from flask import render_template, abort, request, Response, jsonify, url_for, redirect
from flask_mail import Message
from requests import get
from webargs.flaskparser import FlaskParser
from flask.ext.paginate import Pagination
from arguments import search_args
from utils import (pubdetails, pull_feed, create_display_links, getbrowsecontent,
                   SearchPublications, contributor_lists, jsonify_geojson, add_supersede_pubs)
from forms import ContactForm, SearchForm, NumSeries
from canned_text import EMAIL_RESPONSE
from pubs_ui import app, mail
import arrow

#set UTF-8 to be default throughout app
reload(sys)
sys.setdefaultencoding("utf-8")


pub_url = app.config['PUB_URL']
lookup_url = app.config['LOOKUP_URL']
supersedes_url = app.config['SUPERSEDES_URL']
browse_url = app.config['BROWSE_URL']
search_url = app.config['BASE_SEARCH_URL']
citation_url = app.config['BASE_CITATION_URL']
browse_replace = app.config['BROWSE_REPLACE']
contact_recipients = app.config['CONTACT_RECIPIENTS']
replace_pubs_with_pubs_test = app.config.get('REPLACE_PUBS_WITH_PUBS_TEST')
robots_welcome = app.config.get('ROBOTS_WELCOME')

#should requests verify the certificates for ssl connections
verify_cert = app.config['VERIFY_CERT']


@app.route('/robots.txt')
def robots():
    return render_template('robots.txt', robots_welcome=robots_welcome)


@app.route('/')
def index():
    sp = SearchPublications(search_url)
    recent_publications_resp = sp.get_pubs_search_results(params={'pub_x_days': 30, 'page_size': 6}) #bring back recent publications
    recent_pubs_content = recent_publications_resp[0]
    try:
        pubs_records = recent_pubs_content['records']
    except TypeError:
        pubs_records = [] # return an empty list recent_pubs_content is None (e.g. the service is down)
    form = SearchForm(None, obj=request.args)
    form.advanced.data = True
    return render_template('home.html',
                           recent_publications=pubs_records, 
                           form=form,
                           advanced=request.args.get('advanced')
                           )


#contact form
@app.route('/contact', methods=['GET', 'POST'])
def contact():
    contact_form = ContactForm()
    if request.method == 'POST':
        if contact_form.validate_on_submit():
            human_name = contact_form.name.data
            human_email = contact_form.email.data
            if human_name:
                sender_str = '({name}, {email})'.format(name=human_name, email=human_email)
            else:
                sender_str = '({email})'.format(email=human_email)
            subject_line = 'Pubs Warehouse User Comments' # this is want Remedy filters on to determine if an email goes to the pubs support group
            message_body = contact_form.message.data
            message_content = EMAIL_RESPONSE.format(contact_str=sender_str, message_body=message_body)
            msg = Message(subject=subject_line,
                          sender=(human_name, human_email),
                          reply_to=('PUBSV2_NO_REPLY', 'pubsv2_no_reply@usgs.gov'), # this is not what Remedy filters on to determine if a message goes to the pubs support group...
                          recipients=contact_recipients, # will go to servicedesk@usgs.gov if application has DEBUG = False
                          body=message_content
                          )
            mail.send(msg)            
            return redirect(url_for('contact_confirmation')) # redirect to a confirmation page after successful validation and message sending
        else:
            return render_template('contact.html', contact_form=contact_form) # redisplay the form with errors if validation fails
    elif request.method == 'GET':
        return render_template('contact.html', contact_form=contact_form)

    
@app.route('/contact_confirm')
def contact_confirmation():
    confirmation_message = 'Thank you for contacting the USGS Publications Warehouse support team.'
    return render_template('contact_confirm.html', confirm_message=confirmation_message)


#leads to rendered html for publication page
@app.route('/publication/<indexId>')
def publication(indexId):
    r = get(pub_url+'publication/'+indexId, params={'mimetype': 'json'}, verify=verify_cert)
    pubreturn = r.json()
    pubdata = pubdetails(pubreturn)
    pubdata = add_supersede_pubs(pubdata)
    pubdata = create_display_links(pubdata)
    pubdata = contributor_lists(pubdata)
    pubdata = jsonify_geojson(pubdata)
    pubdata['formattedModifiedDateTime'] = arrow.get(pubdata['lastModifiedDate']).format('MMMM DD, YYYY HH:mm:ss')
    # Following if statement added to deal with Apache rewrite of pubs.er.usgs.gov to pubs-test.er.usgs.gov.
    # Flask_images creates a unique signature for an image e.g. pubs.er.usgs.gov/blah/more_blah/?s=skjcvjkdejiwI
    # The Apache rewrite changes this to pubs-test.er.usgs.gov/blah/more_blah/?s=skjcvjkdejiwI, where there is
    # no image with the signature 'skjcvjkdejiwI' which leads to a failure to find the image. Instead of allowing
    # Apache to do the rewrite, this code snippet executes the rewrite so the correct signature is preserved for
    # a given image URL.
    if replace_pubs_with_pubs_test:
        thumbnail_link = pubdata['displayLinks']['Thumbnail'][0]['url']
        thumbmail_link_test = thumbnail_link.replace('pubs', 'pubs-test')
        pubdata['displayLinks']['Thumbnail'][0]['url'] = thumbmail_link_test
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
    app.logger.info('The FAQ function is being called')
    feed_url = 'https://internal.cida.usgs.gov/wiki/createrssfeed.action?types=page&spaces=PUBSWI&title=Pubs+Other+Resources&labelString=pw_faq&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3600&showContent=true&confirm=Create+RSS+Feed'
    return render_template('faq.html', faq_content=pull_feed(feed_url))


@app.route('/documentation/usgs_series')
def usgs_series():
    app.logger.info('The USGS Series function is being called')
    feed_url = 'https://internal.cida.usgs.gov/wiki/createrssfeed.action?types=page&spaces=PUBSWI&title=USGS+Series+Definitions&labelString=usgs_series&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3600&showContent=true&confirm=Create+RSS+Feed'
    return render_template('usgs_series.html', usgs_series_content=pull_feed(feed_url))


@app.route('/documentation/web_service_documentation')
def web_service_docs():
    app.logger.info('The web_service_docs function is being called')
    feed_url = 'https://internal.cida.usgs.gov/wiki/createrssfeed.action?types=page&spaces=PUBSWI&title=Pubs+Other+Resources&labelString=pubs_webservice_docs&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3600&showContent=true&confirm=Create+RSS+Feed'
    return render_template('webservice_docs.html', web_service_docs=pull_feed(feed_url))


@app.route('/documentation/other_resources')
def other_resources():
    app.logger.info('The other_resources function is being called')
    feed_url = 'https://internal.cida.usgs.gov/wiki/createrssfeed.action?types=page&spaces=PUBSWI&title=Pubs+Other+Resources&labelString=other_resources&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3600&showContent=true&confirm=Create+RSS+Feed'
    return render_template('other_resources.html', other_resources=pull_feed(feed_url))


@app.route('/browse/', defaults={'path': ''})
@app.route('/browse/<path:path>')
def browse(path):
    app.logger.info("path: "+path)
    browsecontent = getbrowsecontent(browse_url+path, browse_replace)
    return render_template('browse.html', browsecontent=browsecontent)


#this takes advantage of the webargs package, which allows for multiple parameter entries. e.g. year=1981&year=1976
@app.route('/search', methods=['GET'])
def search_results():
    parser = FlaskParser()
    search_kwargs = parser.parse(search_args, request)
    form = SearchForm(None, obj=request.args,)
    #populate form based on parameter
    form.advanced.data = True
    form_element_list = ['q', 'title', 'contributingOffice', 'contributor', 'typeName', 'subtypeName', 'seriesName', 'reportNumber', 'year']
    for element in form_element_list:
        if len(search_kwargs[element]) > 0:
            form[element].data = search_kwargs[element][0]
    if search_kwargs.get('page_size') is None:
        search_kwargs['page_size'] = '25'
    if search_kwargs.get('page') is None:
        search_kwargs['page'] = '1'
    if search_kwargs.get('page_number') is None and search_kwargs.get('page') is not None:
        search_kwargs['page_number'] = search_kwargs['page']

    sp = SearchPublications(search_url)
    search_results, resp_status_code = sp.get_pubs_search_results(params=search_kwargs) # go out to the pubs API and get the search results
    try:
        search_result_records = search_results['records']
        record_count = search_results['recordCount']
        pagination = Pagination(page=int(search_kwargs['page_number']), total=record_count, per_page=int(search_kwargs['page_size']), record_name='Search Results', bs_version=3)
        search_service_down = None
        start_plus_size = int(search_results['pageRowStart'])+int(search_results['pageSize'])
        if record_count < start_plus_size:
            record_max = record_count
        else:
            record_max = start_plus_size

        result_summary = {'record_count':record_count, 'page_number':search_results['pageNumber'], 'records_per_page':search_results['pageSize'],
                          'record_min':(int(search_results['pageRowStart'])+1), 'record_max':record_max }
    except TypeError:
        search_result_records = None
        pagination = None
        search_service_down = 'The backend services appear to be down with a {0} status.'.format(resp_status_code)
        result_summary = {}
    return render_template('search_results.html', 
                           advanced=search_kwargs['advanced'],
                           result_summary=result_summary,
                           search_result_records=search_result_records,
                           pagination=pagination,
                           search_service_down=search_service_down,
                           form=form
                           )


   
@app.route('/site-map')
def site_map():
    """
    View for troubleshooting application URL rules
    """
    app_urls = []
    
    for url_rule in app.url_map.iter_rules():
        app_urls.append((str(url_rule), str(url_rule.endpoint)))
    
    return render_template('site_map.html', app_urls=app_urls)


@app.route('/newpubs', methods = ['GET'])
def new_pubs():

    num_form = NumSeries()
    sp = SearchPublications(search_url)
    search_kwargs = {'pub_x_days': 30} #bring back recent publications

    if request.args.get('num_series') == 'y':
        num_form = NumSeries(num_series=True)
        search_kwargs['subtypeName'] = 'USGS Numbered Series'

    recent_publications_resp = sp.get_pubs_search_results(params=search_kwargs)
    recent_pubs_content = recent_publications_resp[0]



    try:
        pubs_records = recent_pubs_content['records']
    except TypeError:
        pubs_records = []  # return an empty list recent_pubs_content is None (e.g. the service is down)

    return render_template('new_pubs.html',
                           new_pubs=pubs_records,
                           num_form=num_form)

