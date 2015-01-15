'''
Created on Jan 14, 2015

@author: ayan
'''
import json
from lettuce import world, step
import httpretty
from nose.tools import assert_equal, assert_in
from pubs_ui import app

pub_url = app.config['PUB_URL']
supersedes_url = app.config['SUPERSEDES_URL']

@step
def i_have_imitated_json_from_the_pubs_and_supersedes_api_and_a_client(step):
    world.pub_id = 'fake88421'
    world.pub_url = '{0}publication/{1}'.format(pub_url, world.pub_id)
    world.supersedes_url = supersedes_url
    world.client = app.test_client()
    mock_supersedes = {u'modsCollection': {u'@rowCount': u'1', u'mods': [{u'identifier': {u'#text': u'fake88421', u'@type': u'pw'}, u'location': {u'url': [{u'@note': u'THUMBNAIL', u'#text': u'http://pubs.er.usgs.gov/thumbnails/fake88421.jpg'}, {u'@note': u'DOCUMENT', u'#text': u'http://pubs.usgs.gov/fs/0033-01/report.pdf'}]}, u'relatedItem': [{u'titleInfo': {u'title': u'U.S. Geological Survey World Wide Web Information'}, u'identifier': {u'#text': u'fs05503', u'@type': u'pw'}, u'originInfo': {u'dateIssued': u'2003'}, u'@type': u'succeeding', u'base_id': {u'#text': u'fake88421', u'@type': u'pw'}}, {u'titleInfo': {u'title': u'U.S. Geological Survey World Wide Web Information'}, u'identifier': {u'#text': u'fs07199', u'@type': u'pw'}, u'originInfo': {u'dateIssued': u'2370'}, u'@type': u'preceding', u'base_id': {u'#text': u'fake88421', u'@type': u'pw'}}, {u'titleInfo': {u'title': u'U.S. Geological Survey World Wide Web Information'}, u'identifier': {u'#text': u'fs03700', u'@type': u'pw'}, u'originInfo': {u'dateIssued': u'2000'}, u'@type': u'preceding', u'base_id': {u'#text': u'fake88421', u'@type': u'pw'}}]}]}}
    mock_pub_json = {u'seriesTitle': {u'onlineIssn': u'2327-6932', u'text': u'Fact Sheet', u'id': 313, u'printIssn': u'2327-6916'}, u'publicationType': {u'text': u'Report', u'id': 18}, u'publicationYear': u'2001', u'productDescription': u'2 p.', u'seriesNumber': u'033-01', u'links': [{u'url': u'http://pubs.er.usgs.gov/thumbnails/fake88421.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 5252714, u'rank': 0}, {u'url': u'http://pubs.usgs.gov/fs/0033-01/report.pdf', u'type': {u'text': u'Document', u'id': 11}, u'id': 5386208}], u'language': u'English', u'title': u'U.S. Geological Survey World Wide Web Information', u'costCenters': [], u'lastModifiedDate': u'2014-04-03T08:41:19.000', u'docAbstract': u'The U.S. Geological Survey (USGS) invites\nyou to explore an earth science virtual library\nof digital information, publications, and data.\nThe USGS World Wide Web sites offer an\narray of information that reflects scientific\nresearch and monitoring programs conducted\nin the areas of natural hazards, environmental\nresources, and cartography. This list\nprovides gateways to access a cross section of\nthe digital information on the USGS World\nWide Web sites.', u'indexId': u'fake88421', u'displayToPublicDate': u'2001-07-01T00:00:00.000', u'edition': u'Supersedes FS 037-00 & Superseded by FS 055-03', u'publicationSubtype': {u'text': u'USGS Numbered Series', u'id': 5}, u'usgsCitation': u'U.S. Geological Survey World Wide Web Information; 2001; FS; 033-01; U.S. Geological Survey', u'contributors': {u'authors': [{u'text': u'U.S. Geological Survey', u'rank': 1, u'contributorId': 128075, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': True, u'organization': u'U.S. Geological Survey', u'id': 529229, u'usgs': False}]}, u'publisher': u'U.S. Geological Survey', u'publisherLocation': u'Reston, VA', u'numberOfPages': u'2', u'id': 30722}
    httpretty.enable()
    httpretty.register_uri(httpretty.GET,
                           world.pub_url,
                           body=json.dumps(mock_pub_json),
                           content_type='application/json',
                           status_code=200
                           )

    httpretty.register_uri(httpretty.GET,
                           world.supersedes_url,
                           body=json.dumps(mock_supersedes),
                           content_type='application/json',
                           status_code=200
                           )
    
@step
def i_access_the_publication_page(step):
    world.publication = '/publication/{index_id}'.format(index_id=world.pub_id)
    with world.client as c:
        response = c.get(world.publication)
    world.response_content = response.get_data()
    world.resp_status = response.status_code
    
@step
def i_should_see_a_200_status_code(step):
    httpretty.disable()
    httpretty.enable()
    expected = 200
    assert_equal(expected, world.resp_status)
    
@step
def i_should_see_some_of_the_fake_supersedes_content(step):
    expected_snippet = 'Web Information (2370)'
    assert_in(expected_snippet, world.response_content)