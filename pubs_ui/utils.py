__author__ = 'jameskreft'

from requests import get
import feedparser
from bs4 import BeautifulSoup


def call_api(baseapiurl, index_id):
    r = get(baseapiurl+'/publication/'+index_id)
    pubreturn = r.json()
    pubdata = pubreturn['pub']
    return pubdata


def pubdetails(pubdata):
    """build the ordered list to make the 'Publications details' box

    :param pubdata: the data pulled from the pubs warehouse web service
    :return: pubdata with an additional "details" element
    """

    pubdata['details'] = []
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
        ['temporalStart', 'Time Range Start'],
        ['temporalEnd', 'Time Range End']
    ]
    for detail in detailslist:
        if len(detail) == 3:
            if pubdata.get(detail[0]) is not None and isinstance(pubdata.get(detail[0]), dict):
                pubdata['details'].append({detail[2]: pubdata[detail[0]].get(detail[1])})
            elif pubdata.get(detail[0]) is not None and isinstance(pubdata.get(detail[0]), list):
                dd = ''
                for det in pubdata.get(detail[0]):
                    dd = dd+det.get(detail[1])+', '
                dd = dd[:-2]
                pubdata['details'].append({detail[2]: dd})
        elif pubdata.get(detail[0]) is not None and len(pubdata.get(detail[0])) > 0:
            pubdata['details'].append({detail[1]: pubdata.get(detail[0])})
    return pubdata

def display_links(pubdata):
    """
    restructures links from the API so that they are easy to display in a jinja template
    :param pubdata:
    :return: pubdata with new displayLinks array
    """
    links = pubdata.get("links")
    displaylinks = []
    if links is not None:
        rankcounter = 0
        for link in links:
            if link.get('rank') is None:
                link['rank'] = rankcounter
                rankcounter = rankcounter+1
            displaylinks.append(link)

    pubdata["displayLinks"] = displaylinks
    return pubdata











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

    supersede_array = get(supersedes_url,
                          params={'prod_id': index_id}).json()['modsCollection']['mods'][0]['relatedItem'][0]
    #TODO: deal with pubs with more than one relationship
    return {'type': supersede_array['@type'], 'index_id': supersede_array['identifier']['#text'],
            'title': supersede_array['titleInfo']['title']}

def getbrowsecontent(browseurl):
    """
    Gets
    :param browseurl: url of legacy browse interface
    :return: html content of links
    """
    content = get(browseurl).text
    soup = BeautifulSoup(content)
    links_div = soup.find('div', {"id": "pubs-browse-links"}).contents
    return(unicode(links_div))


