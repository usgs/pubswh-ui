__author__ = 'jameskreft'

from requests import get
import pprint
import feedparser
from bs4 import BeautifulSoup
import json

def call_api(baseapiurl, index_id):
    r = get(baseapiurl+'/publication/'+index_id)
    pubreturn = r.json()
    pubdata= pubreturn['pub']
    return pubdata

def pubdetails(pubdata):
    pubdata['details'] = []
    detailslist = [
        ['publicationType','text','Publication type:'],
        ['publicationSubtype','text', 'Publication Subtype:'],
        ['seriesName','Series name:'],
        ['seriesNumber', 'Series number:'],
        ['issn','online','ISSN (online):'],
        ['issn','print', 'ISSN (print):'],
        ['isbn', 'ISBN:'],
        ['doi', 'DOI:'],
        ['language', 'Language:'],
        ['publisher', 'Publisher:'],
        ['publisherLocation','Publisher location:'],
        ['costCenters','text', 'Contributing office(s):'],
        ['productDescription','Description:'],
        ['numberofPages','Number of pages:'],
        ['startPage','Start page:'],
        ['endPage','End page:'],
        ['temporalStart','Time Range Start'],
        ['temporalEnd','Time Range End']
    ]
    for detail in detailslist:
        if len(detail) == 3:
            if pubdata.get(detail[0]) is not None and isinstance(pubdata.get(detail[0]), dict):
                pubdata['details'].append({detail[2] : pubdata[detail[0]].get(detail[1])})
            elif pubdata.get(detail[0]) is not None and isinstance(pubdata.get(detail[0]),list):
                dd = ''
                for det in pubdata.get(detail[0]):
                    dd = dd+det.get(detail[1])+', '
                dd=dd[:-2]
                pubdata['details'].append({detail[2] : dd})
        elif pubdata.get(detail[0]) is not None and len(pubdata.get(detail[0])) > 0 :
            pubdata['details'].append({detail[1] : pubdata.get(detail[0])})
    return pubdata





def pull_feed (feed_url):
    feed = feedparser.parse(feed_url)

    # Process html to remove unwanted mark-up and fix links
    post = ''
    if len(feed['entries']) > 0:
        soup = BeautifulSoup(feed['entries'][0].summary)

        # Remove edited by paragraph
        soup.p.extract()


        # Remove final div in the feed
        feedDiv = soup.find('div', class_='feed')
        childrenDivs = feedDiv.findAll('div')
        childrenDivs[len(childrenDivs) - 1].extract()

        # Translate any in page links to use relative URL
        base = feed['entries'][0].summary_detail.base
        links = feedDiv.select('a[href^="' + base + '"]')
        for link in links:
            link['href'] = link['href'].replace(base, '')
        post = unicode(soup)

    return post

def supersedes(supersedes_url, indexId):
    supersede_array = get(supersedes_url, params={'prod_id':indexId}).json()['modsCollection']['mods'][0]['relatedItem'][0]
    supersede_info = {}
    supersede_info['type']=supersede_array['@type']
    supersede_info['indexId']=supersede_array['identifier']['#text']
    supersede_info['title']=supersede_array['titleInfo']['title']
    return supersede_info


supersedes('http://pubs.er.usgs.gov/service/citation/json/extras','fs15199')




