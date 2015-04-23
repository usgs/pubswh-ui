__author__ = 'jameskreft'

import requests
import feedparser
from bs4 import BeautifulSoup
import re
from operator import itemgetter
from pubs_ui import app
import json
from urlparse import urljoin
from copy import deepcopy
from itsdangerous import URLSafeTimedSerializer
import arrow
import natsort
from custom_filters import display_publication_info

json_ld_id_base_url = app.config.get('JSON_LD_ID_BASE_URL')
# should requests verify the certificates for ssl connections
verify_cert = app.config['VERIFY_CERT']
base_search_url = app.config['BASE_SEARCH_URL']


def pubdetails(pubdata):
    """
    build the ordered list to make the 'Publications details' box

    :param pubdata: the data pulled from the pubs warehouse web service
    :return: pubdata with an additional "details" element
    """

    pubdata['details'] = []
    # details list element has len of 2 or 3.  If 2, the item is coming back as a simple Key:value object, but if three
    # there are either lists or dicts. the first item in the list is the param in pubdata, the 2nd or 3rd is the display
    # descriptor and the second if it exists is the secondary key needed to get the text.
    detailslist = [
        ['publicationType', 'text', 'Publication type:'],
        ['publicationSubtype', 'text', 'Publication Subtype:'],
        ['title', 'Title:'],
        ['seriesTitle', 'text', 'Series title:'],
        ['seriesNumber', 'Series number:'],
        ['subseriesTitle', 'Subseries'],
        ['chapter', 'Chapter:'],
        ['subchapterNumber', 'Sub-chapter:'],
        ['issn', 'online', 'ISSN (online):'],
        ['issn', 'print', 'ISSN (print):'],
        ['isbn', 'ISBN:'],
        ['doi', 'DOI:'],
        ['edition', 'Edition:'],
        ['volume', 'Volume'],
        ['issue', 'Issue:'],
        ['publicationYear', 'Year Published:'],
        ['language', 'Language:'],
        ['publisher', 'Publisher:'],
        ['publisherLocation', 'Publisher location:'],
        ['costCenters', 'text', 'Contributing office(s):'],
        ['productDescription', 'Description:'],
        ['numberofPages', 'Number of pages:'],
        ['largerWorkType', 'text', 'Larger Work Type:'],
        ['largerWorkSubtype', 'text', 'Larger Work Subtype:'],
        ['largerWorkTitle', 'Larger Work Title:'],
        ['startPage', 'First page:'],
        ['endPage', 'Last page:'],
        ['numberOfPages', 'Number of Pages:'],
        ['publicComments', 'Public Comments:'],
        ['temporalStart', 'Time Range Start:'],
        ['temporalEnd', 'Time Range End:'],
        ['conferenceTitle', 'Conference Title:'],
        ['conferenceLocation', 'Conference Location:'],
        ['conferenceDate', 'Conference Date:'],
        ['country', 'Country:'],
        ['state', 'State:'],
        ['county', 'County:'],
        ['city', 'City:'],
        ['otherGeospatial', 'Other Geospatial:'],
        ['datum', 'Datum:'],
        ['projection', 'Projection:'],
        ['scale', 'Scale:'],
        ['onlineOnly', 'Online Only (Y/N):'],
        ['additionalOnlineFiles', 'Additional Online Files(Y/N):']

    ]
    for detail in detailslist:

        if len(detail) == 3:
            # if the detail exists and is a dict with a couple key:value pairs, get the right value
            if pubdata.get(detail[0]) is not None and isinstance(pubdata.get(detail[0]), dict):
                pubdata['details'].append({detail[2]: pubdata[detail[0]].get(detail[1])})
            # if the thing is a list of dicts and if there is something in the list,
            # concatenate the values into a string
            elif pubdata.get(detail[0]) is not None and isinstance(pubdata.get(detail[0]), list) \
                    and len(pubdata.get(detail[0])) > 0:
                dd = []
                for det in pubdata.get(detail[0]):
                    dd.append(det.get(detail[1]))
                dd = ', '.join(dd)
                pubdata['details'].append({detail[2]: dd})
        elif len(detail) == 2 and pubdata.get(detail[0]) is not None and len(pubdata.get(detail[0])) > 0:
            pubdata['details'].append({detail[1]: pubdata.get(detail[0])})
    return pubdata


def create_display_links(pubdata):
    """
    restructures links from the API so that they are easy to display in a jinja template
    :param pubdata:
    :return: pubdata with new displayLinks array
    """
    if pubdata.get('doi') is not None and pubdata.get('publicationSubtype', {}).get('text') != \
            ('USGS Numbered Series' or 'USGS Unnumbered Series'):
        pubdata['links'].append(
            {
                "rank": None,
                "text": "Publisher Index Page (via DOI)",
                "type": {
                        "id": 15,
                        "text": "Index Page"
                },
                "url": "http://dx.doi.org/"+pubdata['doi']
            })

    display_links = {
        'Abstract': [],
        'Additional Report Piece': [],
        'Appendix': [],
        'Application Site': [],
        'Authors Website': [],
        'Chapter': [],
        'Companion Files': [],
        'Cover': [],
        'Database': [],
        'Digital Object Identifier': [],
        'Document': [],
        'Errata': [],
        'Illustration': [],
        'Image': [],
        'Index Page': [],
        'Metadata': [],
        'Plate': [],
        'Sheet': [],
        'Table': [],
        'Dataset': [],
        'Project Site': [],
        'Raw Data': [],
        'Read Me': [],
        'Referenced Work': [],
        'Related Work': [],
        'Spatial Data': [],
        'Thumbnail': [],
        'Version History': []
    }
    links = deepcopy(pubdata.get("links"))
    # sort links into the different link types

    for key, value in display_links.iteritems():
        for link in links:
            if link['type']['text'] == key:
                value.append(link)
    # smash index page and plate links around
    display_links = manipulate_plate_links(display_links)
    display_links = manipulate_index_page_links(display_links)
    # shove a rank onto everything that doesn't have one
    for key, value in display_links.iteritems():
        rank_counter = 1
        for link in value:
            if link.get("rank") is None:
                link['rank'] = rank_counter
                rank_counter += 1

    pubdata["displayLinks"] = display_links
    # set a variable so that we can display something if the pub has no links other than a thumbnail
    pub_has_no_links = True
    for key, value in display_links.iteritems():
        if key != 'Thumbnail' and len(value) > 0:
            pub_has_no_links = False
    pubdata['pubHasNoLinks'] = pub_has_no_links
    return pubdata


def manipulate_index_page_links(display_links):
    """
    This function rejiggers display text for index page links
    :param display_links:
    :return:
    """
    # only do something if there are links in the index page links section
    if len(display_links.get('Index Page')) > 0:
        for link in display_links["Index Page"]:
            if link.get("text") is None and 'pubs.usgs.gov' in link["url"]:
                link["text"] = "USGS Index Page"
                link["rank"] = 1
            elif link.get("text") is None and 'ngmdb.usgs.gov' in link["url"]:
                link["text"] = "National Geologic Map Database Index Page"
                link["rank"] = 2
            elif link.get("text") is None:
                link["text"] = "Publisher Index Page"
                link['rank'] = 3
            elif link.get("text") == "Publisher Index Page (via DOI)":
                link['rank'] = 4
    return display_links


def manipulate_plate_links(display_links):
    """
    This function rejiggers plate link displays for plate links that are named regularly but do not have display text or
    a proper order
    :param display_links: the
    :return: display links with rejiggered plate link order
    """
    # only do something if there are links in the plate links section
    if len(display_links.get("Plate")) > 0:
        for link in display_links["Plate"]:
            url = link["url"]
            file_name = url.split("/")[-1].split(".")
            text = file_name[0]
            if link.get("text") is None:
                if len(file_name[0].title().split('-')) > 1:
                    try:
                        text = file_name[0].title().split('-')
                        text[1] = int(text[1])
                        link['rank'] = text[1]
                    except (ValueError, IndexError):
                        text = file_name[0].title().split('-')
                if len(file_name[0].split("_")) > 1:
                    try:
                        text = file_name[0].split("_")[-1]
                        text = re.split('(\d+)', text)[0:2]
                        text[1] = int(text[1])
                        link['rank'] = text[1]
                    except (ValueError, IndexError):
                        try:
                            text = file_name[0].split("_")[0]
                            text = re.split('(\d+)', text)[0:2]
                            text[1] = int(text[1])
                            link['rank'] = text[1]
                        except (ValueError, IndexError):
                            text = file_name[0].split("_")

                link["text"] = text
                try:
                    link['text'][1] = str(link['text'][1])
                    link['text'] = " ".join(link['text']).title()
                except (ValueError, TypeError, IndexError):
                    link['text'] = str(link["text"]).title()
            if link.get('linkFileType') is None:
                try:
                    link['linkFileType'] = {'text': file_name[1]}
                except IndexError:
                    link['linkFileType'] = None
        display_links["Plate"] = sorted(display_links["Plate"], key=itemgetter('text'))
    return display_links


def pull_feed(feed_url):
    """
    pull page data from a my.usgs.gov confluence wiki feed
    :param feed_url: the url of the feed, created in confluence feed builder
    :return: the html of the page itself, stripped of header and footer
    """
    feed = feedparser.parse(feed_url)

    # Process html to remove unwanted mark-up and fix links
    post = ''
    if len(feed['entries']) > 0:
        soup = BeautifulSoup(feed['entries'][0].summary)

        # Remove edited by paragraph
        soup.p.extract()

        # Remove final div in the feed
        feed_div = soup.find('div', class_='feed')
        children_divs = feed_div.findAll('div')
        children_divs[len(children_divs) - 1].extract()

        # Translate any in page links to use relative URL
        base = feed['entries'][0].summary_detail.base
        links = feed_div.select('a[href^="' + base + '"]')
        for link in links:
            link['href'] = link['href'].replace(base, '')
        post = unicode(soup)

    return post


def getbrowsecontent(browseurl, browsereplace):
    """
    Gets the content of the legacy browse interface so that it can be used without extension.
    :param browseurl: url of legacy browse interface
    :return: html content of links, breadcrumb, and title
    """
    content = requests.get(browseurl, verify=verify_cert)
    soup = BeautifulSoup(content.text)
    for a in soup.findAll('a'):
        a['href'] = a['href'].replace("browse", browsereplace)
    browse_content = {'links': soup.find('div', {"id": "pubs-browse-links"}).contents,
                      'breadcrumbs': soup.find('div', {"id": "pubs-browse-breadcrumbs"}).contents,
                      'header': soup.find('div', {"id": "pubs-browse-header"}).contents}
    return browse_content


class SearchPublications(object):
    
    """
    Methods for executing various types
    of searches against the backend
    Pubs API.
    
    :param str search_url: URL without any search parameters appended
    """
    
    def __init__(self, search_url):
        self.search_url = search_url
        
    def get_pubs_search_results(self, params=None):
        """
        Searches Pubs API for a specified query parameter

        :param dict params: dictionary of form {'key1': 'value1', 'key2': 'value2}
        :return: query results (or None) and response status code.
        :rtype: tuple
        """
        search_result_obj = requests.get(url=self.search_url, params=params, verify=verify_cert)
        try:
            search_result_json = search_result_obj.json()
            for record in search_result_json['records']:
                contributor_lists(record)
        except ValueError:
            search_result_json = None
        except TypeError:
            search_result_json = None
        resp_status_code = search_result_obj.status_code
        return search_result_json, resp_status_code


def contributor_lists(record):
    """

    :param record: The full pubs record
    :return: The pub record with two kinds of additional lists- one with
    concatenated names and another with concatenated names and types
    """
    contributor_types = ['authors', 'editors', 'compilers']
    for contributor_type in contributor_types:
        if record.get('contributors') is not None:
            if record['contributors'].get(contributor_type) is not None:
                record[contributor_type+"List"] = make_contributor_list(record['contributors'][contributor_type])
                record[contributor_type+"ListTyped"] = \
                    concatenate_contributor_names(record['contributors'][contributor_type])
    return record


def make_contributor_list(contributors):
    """
    Makes a list of names for contributors regardless of type that is easy to join in jinja.  Useful when you need
    a list of names and don't have to do all of the semantic jiggery-poky that one needs for names otherwise.

    :param list contributors: a list of dicts of a contributor type (authors, editors, etc)
    :return list of concatenated author names in given family suffix or corporate name
    :rtype: list
    """
    # turn the list of dicts into smaller, sorted list of dicts
    typed_contributor_list = concatenate_contributor_names(contributors)
    # only grab the string portion of the tuple, put it into its own list.
    contributor_list = []
    for contributor in typed_contributor_list:
        contributor_list.append(contributor["text"])
    return contributor_list


def concatenate_contributor_names(contributors):
    """
    Turns a dict with a lot of split-out contributor information into a simpler format of ("kind", "name")

    :param list contributors: a list of dicts of a contributor type (authors, editors, etc)
    :return:
    """
    # Sort the contributors by the rank that comes out of the web service- ranks is something that will always be there
    # (it is fundamental to the pubs data model, so we don't have to deal with it not being there
    sorted_contributors = sorted(contributors, key=itemgetter('rank'))
    # empty list to build the names
    contributor_list = []
    for contributor in sorted_contributors:
        # test for the boolean "corporation" flag for each contributor
        if contributor['corporation'] is False:
            # list to set up join
            contributor_name_list = []
            # add parts of name to the list if they exist and aren't empty strings
            if contributor.get("given") is not None and len(contributor.get("given")) > 0:
                contributor_name_list.append(contributor['given'])
            if contributor.get("family") is not None and len(contributor.get("family")) > 0:
                contributor_name_list.append(contributor['family'])
            if contributor.get("suffix") is not None and len(contributor.get("suffix")) > 0:
                contributor_name_list.append(contributor['suffix'])
            contributor_dict = {"type": 'person', "text": " ".join(contributor_name_list)}
        # corporate authors- the other side of the boolean
        else:
            contributor_dict = {"type": 'corporation', "text": contributor.get('organization')}
        contributor_list.append(contributor_dict)
    return contributor_list


def jsonify_geojson(record):
    """
    turns the stringified geojson into a python dictionary that can be dumped as valid geojson
    :param record:
    :return record with geojson in geographicExtents:
    """
    geojson = record.get('geographicExtents')
    if geojson is not None:
        try:
            geojson = json.loads(geojson)
            geojson['properties'] = {'title': record.get('title')}
            for feature in geojson['features']:
                feature['id'] = record.get('indexId')+'.base_id'
                feature['properties'] = {'title': record.get('title'),
                                         'id': record.get('indexId'),
                                         'url': json_ld_id_base_url+'publication/'+record.get('indexId'),
                                         'year': record.get('publicationYear'),
                                         'info': display_publication_info(record)
                                         }
            record['geographicExtents'] = geojson
        except Exception as e:
            app.logger.info("Prod ID "+str(record['id'])+" geographicExtents json parse error: "+str(e))
            del record['geographicExtents']
    return record


def legacy_api_info(context_id, supersedes_service_url):
    """
    Obtains supersede info for the context publication from an external (legacy) 
    service, and converts that info into an unambiguous form. Note that, 
    although the service endpoint is parameterized, that's only a convenience
    for exercising and testing this operation. This function contains 
    hard-wired assumptions about 
        - how the context_id is included in the service call;
        - the structure and semantics of the legacy service's return value.

    This function will therefore need to be changed if the supersedes service 
    definition changes.

    :param context_id: indexId of context publication
    :param supersedes_service_url: url for supersede information service
    :return: dict containing three items:
        'predecessors':related items that the context list-valued ub supersedes
        'context_id': the index (prod) ID of the context pub. Included as 
            confirmation only; identical to the 'context_id' param.
        'successors': related items that supersede the context pub
    """
    response = requests.get(supersedes_service_url, params={'prod_id': context_id}, verify=verify_cert)
    if response.status_code == 200:
        response_content = response.json()
        try:
            related = response_content.get('modsCollection', {}).get('mods', [{}])[0].get('relatedItem')
        except TypeError:
            related = None
        try:
            product = response_content.get('modsCollection', {}).get('mods', [{}])[0].get('product')
        except TypeError:
            product = None
    else:
        related = None
        product = None

    # REMARKS ABOUT SERVICE RETURNED VALUE ASSUMPTIONS
    #
    # The service returns JSON, which is converted into Python structures.
    #
    # Note that, despite the structure of the response, the "mods" array will
    # have at most only one contained element.
    #
    # Concerning the sense of the terminology, the occurrence of 
    # '"@type": "succeeding"' or '"@type": "preceding"' refers to the 
    # relationship of the linked pub TO the context pub. 
    #
    # To put it another way, the "@type" relationship descriptor assumes 
    # that the linked pub is the SUBJECT, and the context pub is the OBJECT. 
    # This can be subtly confusing for those of us who have absorbed the RDF 
    # conventions about framing the predicate from the viewpoint of the subject.
    # 
    # Just think of the @type as saying "This linked pub is ___ the context pub."
    offers = None
    if product is not None:
        # check if the product is in stock or not
        product_availabilty = 'schema:OutOfStock'
        if product[0].get('availability') == 'Y':
            product_availabilty = 'schema:InStock'
        # build the offers object
        offers = {
            "@context":
                {"schema": "http://schema.org/"},
            "@type": "schema:ScholarlyArticle",
            "schema:offers": {
                "@type": "schema:Offer",
                "schema:availability": product_availabilty,
                "schema:price": product[0].get('price'),
                "schema:priceCurrency": "USD",
                "schema:url": product[0].get('url'),
                "schema:seller": {
                    "@type": "schema:Organization",
                    "schema:name": "USGS Store",
                    "schema:url": "http://store.usgs.gov"}
                }
            }

    predecessors = []
    successors = []
    if related is not None:
        for item in related:
            try:
                item_summary_info = {'index_id': item['identifier']['#text'], 'title': item['titleInfo']['title'],
                                     'date': item['originInfo']['dateIssued']}

                if item['@type'] == 'preceding':
                    predecessors.append(item_summary_info)
                elif item['@type'] == 'succeeding':
                    successors.append(item_summary_info)
            except KeyError:
                predecessors = []
                successors = []

    return {'predecessors': predecessors, 'context_item': context_id, 'successors': successors, 'offers': offers}


def add_legacy_data(context_pubdata, supersedes_service_url, url_root):
    """
    Accepts publication data JSON for the desired context publication,
    extracts the context publication's index_id, calls precedes_supersedes_url
    for that index_id. If the current publication supersedes, and/or
    is superseded by, any other publications, inserts summary info about 
    those pubs into the passed context_pubdata. 


    context_pubdata: the Python decode of the JSON representation of the 
        context publication
    supersedes_service_url: the endpoint of the service from which info about
        related items should be obtained
    param pubs_base_url: the url needed to compose a publication URL given 
        a known prod_id
    """
    
    base_id_url = urljoin(url_root, 'publication/')
    return_pubdata = deepcopy(context_pubdata)
    index_id = context_pubdata['indexId']
    pub_url = urljoin(base_id_url, index_id)

    # this LITERAL is probably OK for this particular use. However, it
    # needs to be exported to a configuration.
    pub_type = 'rdac:Work'
    
    # obtain predecessor and successor related items
    pre_super = legacy_api_info(index_id, supersedes_service_url)

    if pre_super['predecessors'] or pre_super['successors']:

        # ensure 'relationships' is set up
        if 'relationships' not in return_pubdata:
            return_pubdata['relationships'] = {}
        if '@context' not in return_pubdata['relationships']:
            return_pubdata['relationships']['@context'] = {}
        if '@graph' not in return_pubdata['relationships']:
            return_pubdata['relationships']['@graph'] = []
        # build @context object
        # namespaces
        return_pubdata['relationships']['@context']['dc'] = 'http://purl.org/dc/elements/1.1/'
        return_pubdata['relationships']['@context']['xsd'] = 'http://www.w3.org/2001/XMLSchema#'
        return_pubdata['relationships']['@context']['rdac'] = 'http://rdaregistry.info/Elements/c/'
        return_pubdata['relationships']['@context']['rdaw'] = 'http://rdaregistry.info/Elements/w/'
        # relationships
        return_pubdata['relationships']['@context']['rdaw:replacedByWork'] = {'@type': '@id'}
        return_pubdata['relationships']['@context']['rdaw:replacementOfWork'] = {'@type': '@id'}

        # build @graph object
        # add base/context record
        return_pubdata['relationships']['@graph'].append({
            '@id': pub_url,
            '@type': pub_type,
            'dc:title': return_pubdata['title'],
            'dc:date': str(return_pubdata.get('publicationYear'))
        }
        )

        # add any linked data for superseding another publication
        for item in pre_super['predecessors']:
            related_pub = {
                '@id':  urljoin(base_id_url, item['index_id']),
                '@type': pub_type,
                'dc:title': item['title'],
                "rdaw:replacedByWork": pub_url}
            if item['date']:
                related_pub['dc:date'] = item['date']
            return_pubdata['relationships']['@graph'].append(related_pub)

        # add any linked data for being superseded by another publication
        for item in pre_super['successors']:
            related_pub = {
                '@id': urljoin(base_id_url, item['index_id']),
                '@type': pub_type,
                'dc:title': item['title'],
                "rdaw:replacementOfWork": pub_url
            }
            if item['date']:
                related_pub['dc:date'] = item['date']
            return_pubdata['relationships']['@graph'].append(related_pub)
    # add offer data from the USGS store if it exists
    if pre_super['offers']:
        return_pubdata['offers'] = pre_super['offers']
    return return_pubdata


def change_to_pubs_test(pubs_url):
    """
    flips pubs urls to pubs-test urls to work around annoying apache config on test tier
    :param pubs_url: a pubs.er.usgs.gov url
    :return: a pubs-test.er.usgs.gov url
    """
    pubs_test_url = pubs_url.replace('pubs.er', 'pubs-test.er')
    return pubs_test_url


def generate_auth_header(request):
    """
    This is used to generate the auth header to make requests back to the pubs-services endpoints
    :param request: the request object to get the cookie
    :return: A authorization header that can be sent along to the pubs-services endpoint
    """
    login_serializer = URLSafeTimedSerializer(app.secret_key)
    # get the token cookie from the request
    token_cookie = request.cookies.get('remember_token')
    # set a max age variable that is the same max age as the cookie can be.
    max_age = app.config["REMEMBER_COOKIE_DURATION"].total_seconds()
    # decrypt the cookie to get the username and the token
    session_data = login_serializer.loads(token_cookie, max_age=max_age)
    # get the token from the session data
    mypubs_token = session_data[1]
    # build the auth value to send to the mypubs server
    auth_value = 'Bearer  '+mypubs_token
    # build the Authorization header
    header = {'Authorization': auth_value}
    return header


def make_chapter_data_for_display(pubdata):
    """
    take publication data and munges it around to make it easy to work with in jinja templates
    :param pubdata:  data for a single publication from the pubs-services endpoint
    :return: pubdata
    """
    if len(pubdata.get('interactions')) > 0:
        # natural sort the indexIDs so that chapter 2 comes after chapter one and before chapter three
        pubdata['interactions'] = natsort.natsorted(pubdata['interactions'], key=lambda x: x['subject']['indexId'])
        # determine wheter to display the publication subparts chunk of the template
        for interaction in pubdata['interactions']:
            if interaction['predicate'] == "IS_PART_OF" and interaction['subject']['indexId'] != pubdata['indexId']:
                pubdata['hasSubParts'] = True
            else:
                pubdata['hasSubParts'] = False
    return pubdata


def munge_pubdata_for_display(pubdata, replace_pubs_with_pubs_test, supersedes_url, json_ld_id_base_url):
    """
    Takes publication data from the pubs-services API and smashes it around so that it is friendly for jinja2 templates
    :param pubdata: data for a single publication from the pubs-services endpoint
    :return: pubdata
    """
    pubdata = pubdetails(pubdata)
    pubdata = add_legacy_data(pubdata, supersedes_url, json_ld_id_base_url)
    pubdata = create_display_links(pubdata)
    pubdata = contributor_lists(pubdata)
    pubdata = jsonify_geojson(pubdata)
    pubdata = make_chapter_data_for_display(pubdata)
    pubdata['formattedModifiedDateTime'] = arrow.get(pubdata['lastModifiedDate']).format('MMMM DD, YYYY HH:mm:ss')
    # Following if statement added to deal with Apache rewrite of pubs.er.usgs.gov to pubs-test.er.usgs.gov.
    # Flask_images creates a unique signature for an image e.g. pubs.er.usgs.gov/blah/more_blah/?s=skjcvjkdejiwI
    # The Apache rewrite changes this to pubs-test.er.usgs.gov/blah/more_blah/?s=skjcvjkdejiwI, where there is
    # no image with the signature 'skjcvjkdejiwI' which leads to a failure to find the image. Instead of allowing
    # Apache to do the rewrite, this code snippet executes the rewrite so the correct signature is preserved for
    # a given image URL.
    if replace_pubs_with_pubs_test:
        pubdata['displayLinks']['Thumbnail'][0]['url'] = change_to_pubs_test(
            pubdata['displayLinks']['Thumbnail'][0]['url'])
    return pubdata


def sort_list_of_dicts(list_to_be_sorted, key_name, reverse=False):
    """
    Sort a list of dictionaries by a specified key.
    
    :param list list_to_be_sorted: list of dictionaries to be sorted
    :param str key_name: key in the dictionaries to be sorted by
    :param bool reverse: should the dictionaries be sorted in descending order
    :return: sorted list of dictionaries by specified key
    :rtype: list
    
    """
    new_list = sorted(list_to_be_sorted, key=itemgetter(key_name), reverse=reverse)
    return new_list


def extract_related_pub_info(pubdata):
    """
    Take some json-ld publication and extract the 
    information for preceding and superseding
    publications. If no preceding or superseding
    information is present, empty lists are returned
    for each.
    
    :param dict pubdata: publication JSON data
    :return: a dictionary containing a list containing dictionaries of related publication information
    :rtype: dict
    
    """
    preceding_info = []  # this list may have multiple elements in it
    superceding_info = []  # this list should never have more than 1 element in it
    graph = pubdata.get('relationships', {}).get('@graph', [])
    related_pubs = []
    for graph_element in graph:
        if graph_element.has_key('rdaw:replacedByWork') or graph_element.has_key('rdaw:replacementOfWork'):
            related_pubs.append(graph_element)
    related_length = len(related_pubs)
    if related_length == 0:
        relations = {'precede_len': 0,
                     'supersede_len': 0,
                     'precede_info': [],
                     'supersede_info': []
                     }
    elif related_length >= 1:
        for related_pub in related_pubs:
            item_year = related_pub['dc:date']
            item_title = related_pub['dc:title']
            # provides an absolute URL, but this extracts the id so a relative URL can be made
            item_id = related_pub['@id'].rsplit('/', 1)[1]
            item_info = {'id': item_id,
                         'title': item_title,
                         'year': item_year
                         }
            if related_pub.has_key('rdaw:replacedByWork'):
                preceding_info.append(item_info)
            elif related_pub.has_key('rdaw:replacementOfWork'):
                superceding_info.append(item_info)
        relations = {'precede_len': len(preceding_info),
                     'supersede_len': len(superceding_info),
                     'precede_info': sort_list_of_dicts(preceding_info, 'year'),
                     'supersede_info': sort_list_of_dicts(superceding_info, 'year')
                     }
    else:
        raise Exception('Failed to parse supersede information.')
    return relations