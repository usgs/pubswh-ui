"""
pubswh blueprint views
"""
# pylint: disable=C0103,C0301,C0111,W0613

from datetime import date, timedelta
import json
from operator import itemgetter
from urllib.parse import urlencode, urljoin
import random

import arrow
from dateutil import parser as dateparser
from requests import get
import tablib

from flask import render_template, abort, request, Response, jsonify, url_for, redirect, Blueprint
from flask_paginate import Pagination
from flask_mail import Message

from ..auth.views import authentication_required, is_authenticated, get_auth_header
from .. import app, mail, cache
from .canned_text import EMAIL_RESPONSE
from .forms import ContactForm, NumSeries, PublicAccessContactForm
from .utils import (pull_feed, create_display_links,
                    SearchPublications, change_to_pubs_test,
                    munge_pubdata_for_display, extract_related_pub_info,
                    update_geographic_extents, generate_sb_data, create_store_info,
                    get_altmetric_badge_img_links, generate_dublin_core, get_crossref_data, get_published_online_date,
                    check_public_access, get_unpaywall_data)
from .xml_transformations import transform_xml_full

pubswh = Blueprint('pubswh', __name__,
                   template_folder='templates',
                   static_folder='static',
                   static_url_path='/pubswh/static')
pub_url = app.config['PUB_URL']
lookup_url = app.config['LOOKUP_URL']
search_url = app.config['BASE_SEARCH_URL']
contact_recipients = app.config['CONTACT_RECIPIENTS']
ipds_contact_recipients = app.config.get('IPDS_CONTACT_RECIPIENTS')
robots_welcome = app.config.get('ROBOTS_WELCOME')
json_ld_id_base_url = app.config.get('JSON_LD_ID_BASE_URL')
google_webmaster_tools_code = app.config.get('GOOGLE_WEBMASTER_TOOLS_CODE')
preview_endpoint_url = app.config.get('PREVIEW_ENDPOINT_URL')
crossref_endpoint = app.config['CROSSREF_ENDPOINT']


# should requests verify the certificates for ssl connections
verify_cert = app.config['VERIFY_CERT']


def make_cache_key(*args, **kwargs):
    path = request.path
    args = str(hash(frozenset(request.args.items(True))))
    return path + args


@pubswh.errorhandler(404)
def page_not_found():
    # pylint: disable=W0613
    return render_template('pubswh/404.html'), 404


@pubswh.route("/preview/<index_id>")
@authentication_required
def restricted_page(index_id):
    """
    web page which is restricted and requires the user to be logged in.
    """

    # generate the auth header from the request
    auth_header = get_auth_header()

    # build the url to call the endpoint
    published_status = get(pub_url + 'publication/' + index_id,
                           params={'mimetype': 'json'}, verify=verify_cert).status_code

    # go out to manage and get the record
    response = get(preview_endpoint_url+index_id+'/preview', headers=auth_header, verify=verify_cert,
                   params={'mimetype': 'json'})

    if response.status_code == 200:
        record = response.json()
        pubdata = munge_pubdata_for_display(record, json_ld_id_base_url)
        pub_doi = pubdata.get('doi')
        pub_altmetric_badges, pub_altmetric_details = get_altmetric_badge_img_links(pub_doi, verify=verify_cert)
        small_badge = pub_altmetric_badges['small'] if pub_altmetric_badges is not None else None
        altmetric_links = {'image': small_badge, 'details': pub_altmetric_details}
        pubdata['altmetric'] = altmetric_links
        related_pubs = extract_related_pub_info(pubdata)
        if 'mimetype' in request.args and request.args.get("mimetype") == 'json':
            return jsonify(pubdata)
        return render_template("pubswh/preview.html", indexID=index_id, pubdata=pubdata, related_pubs=related_pubs)

    # if the publication has been published (so it is out of manage) redirect to the right URL
    elif response.status_code == 404 and published_status == 200:
        return redirect(url_for('pubswh.publication', index_id=index_id))

    elif response.status_code == 404 and published_status == 404:
        return render_template('pubswh/404.html'), 404


@pubswh.route('/robots.txt')
def robots():
    return render_template('pubswh/robots.txt', robots_welcome=robots_welcome)


@pubswh.route('/opensearch.xml')
def open_search():
    return render_template('pubswh/opensearch.xml')


@pubswh.route('/' + google_webmaster_tools_code + '.html')
def webmaster_tools_verification():
    return render_template('pubswh/google_site_verification.html')


@pubswh.route('/')
@cache.cached(timeout=300, key_prefix=make_cache_key, unless=is_authenticated)
def index():
    sp = SearchPublications(search_url)
    recent_publications_resp = sp.get_pubs_search_results(params={'pub_x_days': 7,
                                                                  'page_size': 6})  # bring back recent publications

    recent_pubs_content = recent_publications_resp[0]
    try:
        pubs_records = recent_pubs_content['records']
        for record in pubs_records:
            record = create_display_links(record)

    except TypeError:
        pubs_records = []  # return an empty list recent_pubs_content is None (e.g. the service is down)
    return render_template('pubswh/home.html',
                           recent_publications=pubs_records)


# contact form
@pubswh.route('/public_access_contact', methods=['GET', 'POST'])
def pub_access_contact():
    contact_form = PublicAccessContactForm()
    if request.method == 'POST':
        if contact_form.validate_on_submit():
            human_name = contact_form.name.data
            human_email = contact_form.email.data
            if human_name:
                sender_str = '({name}, {email})'.format(name=human_name, email=human_email)
            else:
                sender_str = '({email})'.format(email=human_email)
            # this is want Remedy filters on to determine if an email goes to the pubs support group
            subject_line = 'Pubs Warehouse Public Access request Comments'
            originating_page = contact_form.originating_page.data
            message_body = contact_form.message.data
            message_content = EMAIL_RESPONSE.format(contact_str=sender_str,
                                                    message_body=message_body,
                                                    originating_page=originating_page)
            msg = Message(subject=subject_line,
                          sender=(human_name, human_email),
                          reply_to=('IPDS_Help', 'GS_Help_IPDS@usgs.gov'),
                          # this is not what Remedy filters on to determine if a message
                          # goes to the pubs support group...
                          recipients=ipds_contact_recipients,
                          # will go to gs_ipds_help@usgs.gov if application has DEBUG = False
                          body=message_content)
            mail.send(msg)
            # redirect to a conf page after successful validation and message sending
            return redirect(url_for('pubswh.pub_access_contact_confirmation'))
        else:
            # redisplay the form with errors if validation fails
            return render_template('pubswh/pub_access_contact.html', contact_form=contact_form)

    contact_referrer = request.referrer
    contact_form.originating_page.data = 'Originating Page: {}'.format(contact_referrer)
    title = request.args.get('title')
    index_id = request.args.get('index_id')
    contact_form.message.data = 'I would like to request the full-text public access version of the following ' \
                                'publication: {0} \n\n USGS support team: Get more details on this publication here:' \
                                ' https://pubs.er.usgs.gov/public_access_details/{1}'.format(title, index_id)
    return render_template('pubswh/pub_access_contact.html', contact_form=contact_form)


@pubswh.route('/public_access_contact_confirm')
def pub_access_contact_confirmation():
    confirmation_message = 'Thank you for contacting the USGS Publications Warehouse Public Access support team.'
    return render_template('pubswh/pub_access_contact_confirm.html', confirm_message=confirmation_message)


@pubswh.route('/public_access_details/<index_id>')
@authentication_required
def public_access_details(index_id):
    # build the url to call the endpoint
    r = get(pub_url + 'publication/' + index_id, params={'mimetype': 'json'}, verify=verify_cert)
    if r.status_code in [404, 406]:  # a 406 pretty much always means that it is some sort of other weird malformed URL.
        return render_template('pubswh/404.html'), 404

    pubreturn = r.json()
    pubdata = munge_pubdata_for_display(pubreturn, json_ld_id_base_url)

    return render_template('pubswh/pub_access_data.html', indexID=index_id, pubdata=pubdata, related_pubs=None)


# contact form
@pubswh.route('/contact', methods=['GET', 'POST'])
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
            subject_line = 'Pubs Warehouse User Comments'  # this is want Remedy filters on to determine if an email
            # goes to the pubs support group
            originating_page = contact_form.originating_page.data
            message_body = contact_form.message.data
            message_content = EMAIL_RESPONSE.format(contact_str=sender_str,
                                                    message_body=message_body,
                                                    originating_page=originating_page)
            msg = Message(subject=subject_line,
                          sender=(human_name, human_email),
                          reply_to=('PUBSV2_NO_REPLY', 'pubsv2_no_reply@usgs.gov'),
                          # this is not what Remedy filters on to determine if a message
                          # goes to the pubs support group...
                          recipients=contact_recipients,
                          # will go to servicedesk@usgs.gov if application has DEBUG = False
                          body=message_content)
            mail.send(msg)
            # redirect to a conf page after successful validation and message sending
            return redirect(url_for('pubswh.contact_confirmation'))

        # redisplay the form with errors if validation fails
        return render_template('pubswh/contact.html', contact_form=contact_form)

    contact_referrer = request.referrer
    contact_form.originating_page.data = 'Originating Page: {}'.format(contact_referrer)
    return render_template('pubswh/contact.html', contact_form=contact_form)


@pubswh.route('/contact_confirm')
def contact_confirmation():
    confirmation_message = 'Thank you for contacting the USGS Publications Warehouse support team.'
    return render_template('pubswh/contact_confirm.html', confirm_message=confirmation_message)


def get_pubdata(index_id):
    # pylint: disable=R0914
    r = get(pub_url + 'publication/' + index_id, params={'mimetype': 'json'}, verify=verify_cert)
    # a 406 pretty much always means that it is some sort of other weird malformed URL.
    if r.status_code in [404, 406]:
        return render_template('pubswh/404.html'), 404
    pubreturn = r.json()
    pub_doi = pubreturn.get('doi')
    pub_altmetric_badges, pub_altmetric_details = get_altmetric_badge_img_links(pub_doi, verify=verify_cert)
    small_badge = pub_altmetric_badges['small'] if pub_altmetric_badges is not None else None
    if 'mimetype' in request.args and request.args.get("mimetype") == 'sbjson':
        sbdata = generate_sb_data(pubreturn, json_ld_id_base_url)
        return jsonify(sbdata)
    pubdata = munge_pubdata_for_display(pubreturn, json_ld_id_base_url)
    store_data = create_store_info(r)
    pubdata.update(store_data)
    altmetric_links = {'image': small_badge, 'details': pub_altmetric_details}
    pubdata['altmetric'] = altmetric_links
    crossref_data = get_crossref_data(pubdata.get('doi'))
    online_date_arrow = get_published_online_date(crossref_data)
    pubdata['crossref'] = crossref_data
    pubdata['publicAccess'] = check_public_access(pubdata, online_date_arrow)

    return pubdata


# leads to rendered html for publication page
@pubswh.route('/publication/<index_id>')
@cache.cached(timeout=600, key_prefix=make_cache_key, unless=is_authenticated)
def publication(index_id):

    pubdata = get_pubdata(index_id)
    related_pubs = extract_related_pub_info(pubdata)

    if 'mimetype' in request.args and request.args.get("mimetype") == 'json':
        return jsonify(pubdata)
    if 'mimetype' in request.args and request.args.get("mimetype") == 'dublincore':
        content = generate_dublin_core(pubdata)
        doc = render_template('pubswh/oai_dc.xml', indexID=index_id, content=content)
        return Response(doc, mimetype="application/xml")
    if 'mimetype' in request.args and request.args.get("mimetype") == 'ris':
        content = render_template('pubswh/ris_single.ris', result=pubdata)
        return Response(content, mimetype="application/x-research-info-systems",
                        headers={"Content-Disposition": "attachment;filename=USGS_PW_" + pubdata['indexId'] + ".ris"})

    return render_template('pubswh/publication.html',
                           indexID=index_id,
                           pubdata=pubdata,
                           related_pubs=related_pubs)


# leads to rendered html for an xml publication
@pubswh.route('/publication/<index_id>/full')
def xml_publication(index_id):

    pubdata = get_pubdata(index_id)
    related_pubs = extract_related_pub_info(pubdata)

    return render_template('pubswh/publication.html',
                           indexID=index_id,
                           pubdata=pubdata,
                           related_pubs=related_pubs,
                           html_content=transform_xml_full(app.config['SAMPLE_HTML_CONTENTS'],
                                                           app.config['SPN_IMAGE_URL']))


# clears the cache for a specific page
@pubswh.route('/clear_cache/', defaults={'path': ''})
@pubswh.route('/clear_cache/<path:path>')
def clear_cache(path):
    if app.config['CACHE_TYPE'] == 'redis':
        args = str(hash(frozenset(list(request.args.items()))))
        key = app.config['CACHE_KEY_PREFIX'] + '/' + (path + args).encode('utf-8')
        # Get the StrictRedis instance from the cache_config and delete the key using that.
        # The cache.delete(key) doesn't work for some reason but this does
        app.config['CACHE_REDIS_HOST'].delete(key)
        return 'cache cleared ' + path + " args: " + str(request.args)

    cache.clear()
    return "no redis cache, full cache cleared"


@pubswh.route('/clear_full_cache/')
def clear_full_cache():
    cache.clear()
    return 'cache cleared'


# leads to json for selected endpoints
@pubswh.route('/lookup/<endpoint>')
def lookup(endpoint):
    endpoint_list = ['costcenters', 'publicationtypes', 'publicationsubtypes', 'publicationseries']
    endpoint = endpoint.lower()

    if endpoint not in endpoint_list:
        abort(404)

    r = get(lookup_url + endpoint, params={'mimetype': 'json'}, verify=verify_cert).json()
    return Response(json.dumps(r), mimetype='application/json')


@pubswh.route('/documentation/faq')
@cache.cached(timeout=600, key_prefix=make_cache_key, unless=is_authenticated)
def faq():
    app.logger.info('The FAQ function is being called')
    feed_url = 'https://my.usgs.gov/confluence//createrssfeed.action?types=page&spaces=pubswarehouseinfo&title=Pubs+Other+Resources&labelString=pw_faq&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3600&showContent=true&confirm=Create+RSS+Feed'
    return render_template('pubswh/faq.html', faq_content=pull_feed(feed_url))


@pubswh.route('/documentation/usgs_series')
@cache.cached(timeout=600, key_prefix=make_cache_key, unless=is_authenticated)
def usgs_series():
    app.logger.info('The USGS Series function is being called')
    feed_url = 'https://my.usgs.gov/confluence//createrssfeed.action?types=page&spaces=pubswarehouseinfo&title=USGS+Series+Definitions&labelString=usgs_series&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3600&showContent=true&confirm=Create+RSS+Feed'
    return render_template('pubswh/usgs_series.html', usgs_series_content=pull_feed(feed_url))


@pubswh.route('/documentation/web_service_documentation')
@cache.cached(timeout=600, key_prefix=make_cache_key, unless=is_authenticated)
def web_service_docs():
    app.logger.info('The web_service_docs function is being called')
    feed_url = 'https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=pubswarehouseinfo&title=Pubs+Other+Resources&labelString=pubs_webservice_docs&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3600&showContent=true&confirm=Create+RSS+Feed'
    return render_template('pubswh/webservice_docs.html', web_service_docs=pull_feed(feed_url))


@pubswh.route('/documentation/other_resources')
@cache.cached(timeout=600, key_prefix=make_cache_key, unless=is_authenticated)
def other_resources():
    app.logger.info('The other_resources function is being called')
    feed_url = 'https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=pubswarehouseinfo&title=Pubs+Other+Resources&labelString=other_resources&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3600&showContent=true&confirm=Create+RSS+Feed'
    return render_template('pubswh/other_resources.html', other_resources=pull_feed(feed_url))


@pubswh.route('/browse/')
@cache.cached(timeout=86400, key_prefix=make_cache_key, unless=is_authenticated)
def browse_types():
    types = get(urljoin(pub_url, "lookup/publicationtypes"), verify=verify_cert).json()
    return render_template('pubswh/browse_types.html', types=types)


@pubswh.route('/browse/<pub_type>/')
@cache.cached(timeout=86400, key_prefix=make_cache_key, unless=is_authenticated)
def browse_subtypes(pub_type):
    pub_types = get(urljoin(pub_url, "lookup/publicationtypes"), params={'text': pub_type}, verify=verify_cert).json()
    pub_types_dict = {publication_type['text'].lower(): publication_type['id'] for publication_type in pub_types}
    just_list_pubs = ['book', 'book chapter', 'pamphlet', 'patent', 'speech', 'thesis', 'videorecording', 'conference paper']
    if pub_type.lower() in list(pub_types_dict.keys()):
        if pub_type.lower() in just_list_pubs:
            pubs = get(pub_url + "publication/", params={"mimeType": "tsv", "typeName": pub_type}, verify=verify_cert)
            if pubs.text:
                pubs_data = tablib.Dataset().load(pubs.content.decode('utf-8'))
                pubs_data_dict = pubs_data.dict
                for row in pubs_data_dict:  # you can iterate over this dict becasue it is actually an ordered dict
                    row['indexId'] = row['URL'].split("/")[-1]
                return render_template('pubswh/browse_pubs_list.html',
                                       pub_type=pub_type, pub_subtype=None, series_title=None,
                                       pubs_data=pubs_data_dict)

            return render_template('pubswh/browse_pubs_list.html',
                                   pub_type=pub_type, pub_subtype=None, series_title=None,
                                   pubs_data=None)

        pub_subtypes = get(pub_url + "/lookup/publicationtype/" + str(pub_types_dict[pub_type.lower()]) +
                           "/publicationsubtypes/", verify=verify_cert).json()
        return render_template('pubswh/browse_subtypes.html', pub_type=pub_type, subtypes=pub_subtypes)

    abort(404)


@pubswh.route('/browse/<pub_type>/<pub_subtype>/')
@cache.cached(timeout=86400, key_prefix=make_cache_key, unless=is_authenticated)
def browse_subtype(pub_type, pub_subtype):
    subtype_has_no_series = ['usgs data release', 'website', 'database-nonspatial', 'database-spatial', 'letter',
                             'newspaper article', 'review', 'other report', 'organization series', 'usgs unnumbered series']
    pub_types = get(urljoin(pub_url, "lookup/publicationtypes"), params={'text': pub_type}, verify=verify_cert).json()
    pub_types_dict = {publication_type['text'].lower(): publication_type['id'] for publication_type in pub_types}
    if pub_type.lower() in list(pub_types_dict.keys()):
        pub_subtypes = get(pub_url + "/lookup/publicationtype/" +
                           str(pub_types_dict[pub_type.lower()]) + "/publicationsubtypes/", verify=verify_cert).json()
        pub_subtypes_dict = {publication_subtype['text'].lower(): publication_subtype['id']
                             for publication_subtype in pub_subtypes}
        if pub_subtype.lower() in list(pub_subtypes_dict.keys()):
            if pub_subtype.lower() in subtype_has_no_series:
                pubs = get(pub_url + "publication/", params={"mimeType": "tsv", "typeName": pub_type,
                                                             "subtypeName": pub_subtype}, verify=verify_cert)
                if pubs.text:
                    pubs_data = tablib.Dataset().load(pubs.content.decode('utf-8'))
                    pubs_data_dict = pubs_data.dict
                    for row in pubs_data_dict:  # you can iterate over this dict because it is actually an ordered dict
                        row['indexId'] = row['URL'].split("/")[-1]
                    return render_template('pubswh/browse_pubs_list.html',
                                           pub_type=pub_type, pub_subtype=pub_subtype, series_title=None,
                                           pubs_data=pubs_data_dict)

                return render_template('pubswh/browse_pubs_list.html',
                                       pub_type=pub_type, pub_subtype=pub_subtype, series_title=None,
                                       pubs_data=None)

            series_data = get(urljoin(pub_url, 'lookup/publicationtype/{0}/publicationsubtype/{1}/publicationseries'.format(
                str(pub_types_dict[pub_type.lower()]),
                str(pub_subtypes_dict[pub_subtype.lower()])
            )), verify=verify_cert).json()
            return render_template('pubswh/browse_subtype.html',
                                   pub_type=pub_type, pub_subtype=pub_subtype, series_titles=series_data)

    abort(404)


@pubswh.route('/browse/<pub_type>/<pub_subtype>/<pub_series_name>/')
@cache.cached(timeout=86400, key_prefix=make_cache_key, unless=is_authenticated)
def browse_series(pub_type, pub_subtype, pub_series_name):
    pub_types = get(pub_url + "/lookup/publicationtypes", params={'text': pub_type}, verify=verify_cert).json()
    pub_types_dict = {
        publication_type['text'].lower(): publication_type['id']
        for publication_type in pub_types
    }
    if pub_type.lower() in list(pub_types_dict.keys()):
        pub_subtypes = get(pub_url + "/lookup/publicationtype/" +
                           str(pub_types_dict[pub_type.lower()]) + "/publicationsubtypes/", verify=verify_cert).json()
        pub_subtypes_dict = {
            publication_subtype['text'].lower(): publication_subtype['id']
            for publication_subtype in pub_subtypes
        }
        if pub_subtype.lower() in list(pub_subtypes_dict.keys()):
            series_data = get(pub_url + "/lookup/publicationtype/" +
                              str(pub_types_dict[pub_type.lower()]) + "/publicationsubtype/" +
                              str(pub_subtypes_dict[pub_subtype.lower()]) + "/publicationseries", verify=verify_cert).json()
            pub_series_dict = {
                publication_series['text'].lower(): publication_series['id']
                for publication_series in series_data
            }
            if pub_series_name.lower() in list(pub_series_dict.keys()):
                year = int(arrow.utcnow().year)+1
                generate_years = {
                    'fact sheet': list(range(1994, year)),
                    'open-file report': list(range(1902, year)),
                    'scientific investigations report': list(range(2004, year)),
                    'professional paper': list(range(1902, year)),
                    'water-resources investigations report': list(range(1972, 2006)),
                    'water supply paper': list(range(1896, 2002)),
                    'circular': list(range(1933, year))
                }
                if pub_series_name.lower() in list(generate_years.keys()):
                    return render_template('pubswh/browse_series_years.html',
                                           pub_type=pub_type, pub_subtype=pub_subtype, series_title=pub_series_name,
                                           year_range=generate_years[pub_series_name.lower()])
                pubs = get(
                    urljoin(pub_url, "publication"), params={
                        "mimeType": "csv",
                        "subtypeName": pub_subtype,
                        "seriesName": pub_series_name,
                        "typeName": pub_type
                    },
                    verify=verify_cert
                )
                if pubs.text:
                    pubs_data = tablib.Dataset().load(pubs.content.decode('utf-8'))
                    pubs_data_dict = pubs_data.dict
                    for row in pubs_data_dict:  # you can iterate over this dict becasue it is actually an ordered dict
                        row['indexId'] = row['URL'].split("/")[-1]
                    return render_template('pubswh/browse_pubs_list.html',
                                           pub_type=pub_type, pub_subtype=pub_subtype, series_title=pub_series_name,
                                           pubs_data=pubs_data_dict)

                return render_template('pubswh/browse_pubs_list.html',
                                       pub_type=pub_type, pub_subtype=pub_subtype, series_title=pub_series_name,
                                       pubs_data=None)

    abort(404)


@pubswh.route('/browse/<pub_type>/<pub_subtype>/<pub_series_name>/<year>/')
@cache.cached(timeout=86400, key_prefix=make_cache_key, unless=is_authenticated)
def browse_series_year(pub_type, pub_subtype, pub_series_name, year):
    pub_types = get(pub_url + "/lookup/publicationtypes", params={'text': pub_type}, verify=verify_cert).json()
    pub_types_dict = {publication_type['text'].lower(): publication_type['id'] for publication_type in pub_types}
    if pub_type.lower() in list(pub_types_dict.keys()):
        pub_subtypes = get(pub_url + "/lookup/publicationtype/" +
                           str(pub_types_dict[pub_type.lower()]) + "/publicationsubtypes/", verify=verify_cert).json()
        pub_subtypes_dict = {publication_subtype['text'].lower(): publication_subtype['id']
                             for publication_subtype in pub_subtypes}
        if pub_subtype.lower() in list(pub_subtypes_dict.keys()):
            series_data = get(pub_url + "/lookup/publicationtype/" +
                              str(pub_types_dict[pub_type.lower()]) + "/publicationsubtype/" +
                              str(pub_subtypes_dict[pub_subtype.lower()]) + "/publicationseries", verify=verify_cert).json()
            pub_series_dict = {publication_series['text'].lower(): publication_series['id']
                               for publication_series in series_data}
            if pub_series_name.lower() in list(pub_series_dict.keys()):
                pubs = get(pub_url + "publication/", params={"mimeType": "csv", "subtypeName": pub_subtype,
                                                             "seriesName": pub_series_name, "typeName": pub_type,
                                                             "year": year}, verify=verify_cert)
                if pubs.text:
                    pubs_data = tablib.Dataset().load(pubs.content.decode('utf-8'))
                    pubs_data_dict = pubs_data.dict
                    for row in pubs_data_dict:  # you can iterate over this dict becasue it is actually an ordered dict
                        row['indexId'] = row['URL'].split("/")[-1]
                    return render_template('pubswh/browse_pubs_list.html',
                                           pub_type=pub_type, pub_subtype=pub_subtype, series_title=pub_series_name,
                                           pubs_data=pubs_data_dict, pub_year=year)

                return render_template('pubswh/browse_pubs_list.html',
                                       pub_type=pub_type, pub_subtype=pub_subtype, series_title=pub_series_name,
                                       pubs_data=None, pub_year=year)

    abort(404)


@pubswh.route('/search', methods=['GET'])
@cache.cached(timeout=20, key_prefix=make_cache_key, unless=is_authenticated)
def search_results():
    # pylint: disable=R0914,R0915,R0914,R0912
    search_kwargs = request.args.to_dict(flat=False)
    page = search_kwargs.get('page')
    query_request_args = search_kwargs.copy()
    if page:
        del query_request_args['page']

    # Remove the mimeType so that json will be returned from the web service call
    if 'mimetype' in search_kwargs:
        del search_kwargs['mimetype']

    # Default paging parameters if not present or empty
    if not search_kwargs.get('page_size'):
        search_kwargs['page_size'] = ['25']
    if not page or (len(page) == 1 and not page[0]):
        search_kwargs['page'] = ['1']
    if not search_kwargs.get('page_number'):
        search_kwargs['page_number'] = search_kwargs.get('page')

    # go out to the pubs API and get the search results
    sp = SearchPublications(search_url)
    search_results_response, resp_status_code = sp.get_pubs_search_results(params=search_kwargs)
    search_result_records = []
    pagination = None
    result_summary = {}
    search_service_down = None
    if resp_status_code == 200:
        try:
            search_result_records = search_results_response.get('records', []) if search_results_response else []
            record_count = search_results_response['recordCount']
            pagination = Pagination(page=int(search_kwargs['page_number'][0]), total=record_count,
                                    per_page=int(search_kwargs['page_size'][0]), record_name='Search Results', bs_version=3)
            start_plus_size = int(search_results_response['pageRowStart']) + int(search_results_response['pageSize'])
            if record_count < start_plus_size:
                record_max = record_count
            else:
                record_max = start_plus_size

            result_summary = {'record_count': record_count, 'page_number': search_results_response['pageNumber'],
                              'records_per_page': search_results_response['pageSize'],
                              'record_min': (int(search_results_response['pageRowStart']) + 1), 'record_max': record_max}
        except TypeError:
            search_service_down = 'Unexpected error.'
    else:
        search_service_down = 'The backend services appear to be down with a {0} status.'.format(resp_status_code)

    mimetype = request.args.get('mimetype', '')
    if mimetype == 'ris':
        content = render_template('pubswh/ris_output.ris', search_result_records=search_result_records)
        response = Response(
            content,
            mimetype="application/x-research-info-systems",
            headers={"Content-Disposition": "attachment;filename=PubsWarehouseResults.ris"}
        )
    elif mimetype == 'sbjson':
        sciencebase_records = []
        for record in search_result_records:
            sb_record = generate_sb_data(record, json_ld_id_base_url)
            sciencebase_records.append(sb_record)
        sb_response = {
            "pageSize": search_results_response['pageSize'],
            "pageRowStart": search_results_response['pageRowStart'],
            "pageNumber": search_results_response['pageNumber'],
            "recordCount": search_results_response['recordCount'],
            "records": sciencebase_records,
        }
        response = jsonify(sb_response)
    elif mimetype == 'dublincore':
        dublinecore_records = []
        for record in search_result_records:
            dublincore_record = generate_dublin_core(record)
            dublinecore_records.append({
                "identifier": record['indexId'],
                "dublincore_record": dublincore_record
            })
        content = render_template(
            'pubswh/oai_dc_multiple.xml',
            search_result_records=dublinecore_records,
            mimetype='application/xml')
        response = Response(content, mimetype="application/xml")
    else:
        for record in search_result_records:
            update_geographic_extents(record)

        response = render_template('pubswh/search_results.html',
                                   result_summary=result_summary,
                                   search_result_records=search_result_records,
                                   pagination=pagination,
                                   search_service_down=search_service_down,
                                   query_request_string=urlencode(query_request_args, True))

    return response


@pubswh.route('/site-map')
def site_map():
    """
    View for troubleshooting application URL rules
    """
    app_urls = []

    for url_rule in app.url_map.iter_rules():
        app_urls.append((str(url_rule), str(url_rule.endpoint)))

    return render_template('pubswh/site_map.html', app_urls=app_urls)


@pubswh.route('/newpubs', methods=['GET'])
@cache.cached(timeout=60, key_prefix=make_cache_key, unless=is_authenticated)
def new_pubs():
    num_form = NumSeries()
    sp = SearchPublications(search_url)
    search_kwargs = {'pub_x_days': 30, "page_size": 500}  # bring back recent publications

    # Search if num_series subtype was checked in form
    if request.args.get('num_series') == 'y':
        num_form.num_series.data = True
        search_kwargs['subtypeName'] = 'USGS Numbered Series'

    # Handles dates from form. Searches back to date selected or defaults to past 30 days.
    if request.args.get('date_range'):
        time_diff = date.today() - dateparser.parse(request.args.get('date_range')).date()
        day_diff = time_diff.days
        if not day_diff > 0:
            num_form.date_range.data = date.today() - timedelta(30)
            search_kwargs['pub_x_days'] = 30
        else:
            num_form.date_range.data = dateparser.parse(request.args.get('date_range'))
            search_kwargs['pub_x_days'] = day_diff
    else:
        num_form.date_range.data = date.today() - timedelta(30)

    recent_publications_resp = sp.get_pubs_search_results(params=search_kwargs)
    recent_pubs_content = recent_publications_resp[0]

    try:
        pubs_records = recent_pubs_content['records']
        pubs_records.sort(key=itemgetter('displayToPublicDate'), reverse=True)
        for record in pubs_records:
            record['FormattedDisplayToPublicDate'] = \
                arrow.get(record['displayToPublicDate']).format('MMMM DD, YYYY HH:mm')
    except TypeError:
        pubs_records = []  # return an empty list recent_pubs_content is None (e.g. the service is down)

    return render_template('pubswh/new_pubs.html',
                           new_pubs=pubs_records,
                           num_form=num_form)


@pubswh.route('/legacysearch/search:advance/page=1/series_cd=<series_code>/year=<pub_year>/report_number=<report_number>')
@pubswh.route('/legacysearch/search:advance/page=1/series_cd=<series_code>/report_number=<report_number>')
def legacy_search(series_code=None, report_number=None, pub_year=None):
    """
    This is a function to deal with the fact that the USGS store has dumb links to the warehouse
    based on the legacy search, which had all the query params in a backslash-delimited group.  A couple lines of
    javascript on the index page (see the bottom script block on the index page) passes the legacy query string to this
    function, and then this function reinterprets the string and redirects to the new search.

    :param series_code: the series code, which we will have to map to series name
    :param pub_year: the publication year, two digit, so we will have to make a guess as to what century they want
    :param report_number: report number- we can generally just pass this through
    :return: redirect to new search page with legacy arguments mapped to new arguments
    """
    # all the pubcodes that might be coming from the USGS store
    # usgs_series_codes = {
    #     'AR': 'Annual Report', 'A': 'Antarctic Map', 'B': 'Bulletin', 'CIR': 'Circular',
    #     'CP': 'Circum-Pacific Map', 'COAL': 'Coal Map', 'DS': 'Data Series', 'FS': 'Fact Sheet',
    #     'GF': 'Folios of the Geologic Atlas', 'GIP': 'General Information Product',
    #     'GQ': 'Geologic Quadrangle', 'GP': 'Geophysical Investigation Map', 'HA': 'Hydrologic Atlas',
    #     'HU': 'Hydrologic Unit', 'I': 'IMAP', 'L': 'Land Use/ Land Cover',
    #     'MINERAL': 'Mineral Commodities Summaries', 'MR': 'Mineral Investigations Resource Map',
    #     'MF': 'Miscellaneous Field Studies Map', 'MB': 'Missouri Basin Study', 'M': 'Monograph',
    #     'OC': 'Oil and Gas Investigation Chart', 'OM': 'Oil and Gas Investigation Map',
    #     'OFR': 'Open-File Report', 'PP': 'Professional Paper', 'RP': 'Resource Publication',
    #     'SIM': 'Scientific Investigations Map', 'SIR': 'Scientific Investigations Report',
    #     'TM': 'Techniques and Methods', 'TWRI': 'Techniques of Water-Resource Investigation',
    #     'TEI': 'Trace Elements Investigations', 'TEM': 'Trace Elements Memorandum',
    #     'WDR': 'Water Data Report', 'WSP': 'Water Supply Paper',
    #     'WRI': 'Water-Resources Investigations Report'
    # }

    # horrible hack to deal with the fact that the USGS store apparently never heard of 4 digit dates

    if pub_year is not None:
        if 30 <= int(pub_year) < 100:
            pub_year = ''.join(['19', pub_year])
        elif int(pub_year) < 30:
            pub_year = ''.join(['20', pub_year])
        return redirect(url_for('pubswh.search_results', q=series_code+" " + report_number, year=pub_year))

    return redirect(url_for('pubswh.search_results', q=series_code + " " + report_number))


@pubswh.route('/service/rss/')
@cache.cached(timeout=30, key_prefix=make_cache_key)
def rss():
    """
    This basically makes it so that the many hundreds of RSS Readers that point at the old service RSS field will work
    by proxying the pubs-services RSS Request to the pubs/service RSS request.  We are doing this rather than mapping at
    the apache level so that we have a little more flexibility in the future.
    :return:
    """
    url = urljoin(pub_url, 'publication/rss')
    req = get(url)
    return Response(req.content, content_type=req.headers['content-type'])


@pubswh.route('/unapi')
def unapi():
    """
    this is an unapi format, which appears to be the only way to get a good export to zotero that has all the
    Zotero fields, Documented here: http://unapi.info/specs/
    :return: rendered template of (at this time) bibontology rdf, which maps directly to Zotero Fields
    """

    formats = {'rdf_bibliontology': {'type': 'application/xml', 'docs': "http://bibliontology.com/specification",
                                     'template': 'rdf_bibliontology.rdf'}}
    unapi_id = request.args.get('id')
    unapi_format = request.args.get('format')
    if unapi_format is None or unapi_format not in formats:
        if unapi_id is not None:
            unapi_id = unapi_id.split('/')[-1]
        return render_template('pubswh/unapi_formats.xml', unapi_id=unapi_id, formats=formats, mimetype='text/xml')
    if unapi_id is not None and unapi_format in formats:
        unapi_id = unapi_id.split('/')[-1]
        r = get(pub_url + 'publication/' + unapi_id, params={'mimetype': 'json'}, verify=verify_cert)
        if r.status_code == 404:
            return render_template('pubswh/404.html'), 404
        pubdata = r.json()
        return render_template('pubswh/'+formats[unapi_format]['template'], pubdata=pubdata, formats=formats,
                               mimetype='text/xml')


@pubswh.route('/sitemap.xml')
@cache.cached(timeout=4320000, key_prefix=make_cache_key)
def sitemap_index():
    """
    This function makes is used to generate the index sitemap so that there is not one giant sitemap with too many URLs
    :return: a sitemap index xml file as described at sitemaps.org
    """
    year = int(arrow.now().format('YYYY'))
    year_range = list(range(1900, year+2))
    response = Response(response=render_template('pubswh/sitemap_index.xml', years=year_range), mimetype='application/xml')
    return response


@pubswh.route('/sitemaps/<year>/')
@cache.cached(timeout=random.randint(80000, 90000), key_prefix=make_cache_key)  # make the cache last a day-ish
def sitemap_list(year):
    """
    This function grabs content from the streaming service and generates a list that can be used to make
    sitemap.xml data
    :param year: The year that were are interested in
    :return: a rendered sitemap.xml file
    """
    # there are only a few hundred pubs before 1900, so we will get them all at once
    params = {"mimeType": "json", "page_size": 5000}
    if year == 1900:
        params['endYear'] = year
    else:
        params['year'] = year
    pubs = get(pub_url + "publication/", params=params, verify=verify_cert)
    records_list = []
    for record in pubs.json()['records']:
        records_list.append({'indexId': record['indexId'], 'modified': record.get('lastModifiedDate')})
    response = Response(response=render_template('pubswh/sitemap_list.xml', publication_list=records_list),
                        mimetype='application/xml')
    return response
