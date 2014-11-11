__author__ = 'jameskreft'

import requests
import feedparser
from bs4 import BeautifulSoup
import re
from operator import itemgetter
from pubs_ui import app
import json



def pubdetails(pubdata):
    """
    build the ordered list to make the 'Publications details' box

    :param pubdata: the data pulled from the pubs warehouse web service
    :return: pubdata with an additional "details" element
    """

    pubdata['details'] = []
    #details list element has len of 2 or 3.  If 2, the item is coming back as a simple Key:value object, but if three
    # there are either lists or dicts. the first item in the list is the param in pubdata, the 2nd or 3rd is the display
    # descriptor and the second if it exists is the secondary key needed to get the text.
    detailslist = [
        ['publicationType', 'text', 'Publication type:'],
        ['publicationSubtype', 'text', 'Publication Subtype:'],
        ['seriesName', 'Series name:'],
        ['seriesNumber', 'Series number:'],
        ['issn', 'online', 'ISSN (online):'],
        ['issn', 'print', 'ISSN (print):'],
        ['isbn', 'ISBN:'],
        ['doi', 'DOI:'],
        ['language', 'Language:'],
        ['publisher', 'Publisher:'],
        ['publisherLocation', 'Publisher location:'],
        ['costCenters', 'text', 'Contributing office(s):'],
        ['productDescription', 'Description:'],
        ['numberofPages', 'Number of pages:'],
        ['startPage', 'Start page:'],
        ['endPage', 'End page:'],
        ['temporalStart', 'Time Range Start:'],
        ['temporalEnd', 'Time Range End:'],
        ['conferenceTitle', 'Conference Title:'],
        ['conferenceLocation', 'Conference Location'],
        ['conferenceDate', 'Conference Date:']
    ]
    for detail in detailslist:

        if len(detail) == 3:
            #if the detail exists and is a dict with a couple key:value pairs, get the right value
            if pubdata.get(detail[0]) is not None and isinstance(pubdata.get(detail[0]), dict):
                pubdata['details'].append({detail[2]: pubdata[detail[0]].get(detail[1])})
            #if the thing is a list of dicts and if there is something in the list, concatenate the values into a string
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
        'Project Site': [],
        'Raw Data': [],
        'Read Me': [],
        'Referenced Work': [],
        'Related Work': [],
        'Spatial Data': [],
        'Thumbnail': [],
        'Version History': []
    }
    links = pubdata.get("links")
    for linktype in display_links:
        rankcounter = 1
        for link in links:
            if link['type']['text'] == linktype:
                if link.get('rank') is None:
                    link['rank'] = rankcounter
                    rankcounter += 1
                display_links[linktype].append(link)
    display_links = manipulate_plate_links(display_links)
    pubdata["displayLinks"] = display_links
    return pubdata


def manipulate_plate_links(display_links):
    """
    This function rejiggers plate link displays for plate links that are named regularly but do not have display text or
    a proper order
    :param display_links:
    :return: display links with rejiggered plate link order
    """
    #only do something if there are links in the plate links section
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
                    except (ValueError, IndexError):
                        text = file_name[0].title().split('-')
                if len(file_name[0].split("_")) > 1:
                    try:
                        text = file_name[0].split("_")[-1]
                        text = re.split('(\d+)', text)[0:2]
                        text[1] = int(text[1])
                    except (ValueError, IndexError):
                        try:
                            text = file_name[0].split("_")[0]
                            text = re.split('(\d+)', text)[0:2]
                            text[1] = int(text[1])
                        except (ValueError, IndexError):
                            text = file_name[0].split("_")

                link["text"] = text
            if link.get('linkFileType') is None:
                link['linkFileType'] = {'text': file_name[1]}
        display_links["Plate"] = sorted(display_links["Plate"], key=itemgetter('text'))
        rankcounter = 1
        for link in display_links["Plate"]:
            link['rank'] = rankcounter
            rankcounter += 1
            link['text'][1] = str(link['text'][1])
            link['text'] = " ".join(link['text']).title()
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


def supersedes(supersedes_url, index_id):
    """
    pull supersede info for a pub from legacy "extras" endpoint
    :param supersedes_url:url for extras endpoint
    :param index_id: index_id of pub
    :return: dict of relevant supersede info
    """

    supersede_array = requests.get(supersedes_url,
                                   params={'prod_id': index_id}).json()['modsCollection']['mods'][0]['relatedItem'][0]
    #TODO: deal with pubs with more than one relationship
    return {'type': supersede_array['@type'], 'index_id': supersede_array['identifier']['#text'],
            'title': supersede_array['titleInfo']['title']}


def getbrowsecontent(browseurl, browsereplace):
    """
    Gets the content of the legacy browse interface so that it can be used without extension.
    :param browseurl: url of legacy browse interface
    :return: html content of links, breadcrumb, and title
    """
    content = requests.get(browseurl).text
    soup = BeautifulSoup(content)
    for a in soup.findAll('a'):
        a['href'] = a['href'].replace("browse", browsereplace)
    browse_content = {'links':soup.find('div', {"id": "pubs-browse-links"}).contents}
    browse_content['breadcrumbs'] = soup.find('div', {"id": "pubs-browse-breadcrumbs"}).contents
    browse_content['header'] = soup.find('div', {"id": "pubs-browse-header"}).contents

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
        
    def get_pubs_search_results(self, params):
        """
        Searches Pubs API for a specified query parameter
        
        :param str search_url: URL without any search parameters appended
        :param dict params: dictionary of form {'key1': 'value1', 'key2': 'value2}
        :return: query results (or None) and response status code.
        :rtype: tuple
        """
        search_result_obj = requests.get(url=self.search_url, params=params)
        try:
            search_result_json = search_result_obj.json()
            for record in search_result_json['records']:
                if record.get("authors") is not None:
                    contributor_lists(record)
        except ValueError:
            search_result_json = None
        resp_status_code = search_result_obj.status_code
        return search_result_json, resp_status_code


def contributor_lists(record):
    contributor_types = ['authors', 'editors']
    for contributor_type in contributor_types:
        if record.get(contributor_type) is not None:
            record[contributor_type+"List"] = make_contributor_list(record[contributor_type])
            record[contributor_type+"ListTyped"] = concatenate_contributor_names(record[contributor_type])
    return record


def make_contributor_list(contributors):
    """
    Makes a list of names for contributors regardless of type that is easy to join in jinja.  Useful when you need
    a list of names and don't have to do all of the semantic jiggery-poky that one needs for names otherwise.

    :param list contributors: a list of dicts of a contributor type (authors, editors, etc)
    :return list of concatenated author names in given family suffix or corporate name
    :rtype: list
    """
    #turn the list of dicts into smaller, sorted list of dicts
    typed_contributor_list = concatenate_contributor_names(contributors)
    #only grab the string portion of the tuple, put it into its own list.
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
    #Sort the contributors by the rank that comes out of the web service- ranks is something that will always be there
    #  (it is fundamental to the pubs data model, so we don't have to deal with it not being there
    sorted_contributors = sorted(contributors, key=itemgetter('rank'))
    #empty list to build the names
    contributor_list = []
    for contributor in sorted_contributors:
        #test for the boolean "corporation" flag for each contributor
        if contributor['corporation'] is False:
            #list to set up join
            contributor_name_list = []
            #add parts of name to the list if they exist and aren't empty strings
            if contributor.get("given") is not None and len(contributor.get("given")) > 0:
                contributor_name_list.append(contributor['given'])
            if contributor.get("family") is not None and len(contributor.get("family")) > 0:
                contributor_name_list.append(contributor['family'])
            if contributor.get("suffix") is not None and len(contributor.get("suffix")) > 0:
                contributor_name_list.append(contributor['suffix'])
            contributor_dict = {"type": 'person', "text": " ".join(contributor_name_list)}
        #corporate authors- the other side of the boolean
        elif contributor['corporation'] is True:
            contributor_dict = {"type": 'corporation', "text": contributor.get('organization')}
        contributor_list.append(contributor_dict)
    return contributor_list

def jsonify_geojson(record):
    """
    turns the stringified geojson into actual json
    :param record:
    :return record with geojson in geographicExtents:
    """
    geojson = record.get('geographicExtents')
    if geojson is not None:
        try:
            geojson = json.loads(geojson)
            record['geographicExtents'] = geojson
        except Exception as e:
            app.logger.info("Prod ID "+str(record['id'])+" geographicExtents json parse error: "+str(e))
            del record['geographicExtents']
    return record

