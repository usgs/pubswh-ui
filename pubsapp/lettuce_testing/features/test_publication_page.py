'''
Created on Jan 14, 2015

@author: ayan
'''
import json
from lettuce import world, step
import httpretty
from nose.tools import assert_equal, assert_in
from pubsapp import app

pub_url = app.config['PUB_URL']
supersedes_url = app.config['SUPERSEDES_URL']

@step
def i_have_imitated_json_from_the_pubs_and_supersedes_api_and_a_client(step):
    world.pub_id = 'fs05503'
    world.pub_url = '{0}publication/{1}'.format(pub_url, world.pub_id)
    world.supersedes_url = supersedes_url
    world.client = app.test_client()
    mock_supersedes = {u'modsCollection': {u'@rowCount': u'1', u'mods': [{u'identifier': {u'#text': u'fake88421', u'@type': u'pw'}, u'location': {u'url': [{u'@note': u'THUMBNAIL', u'#text': u'http://pubs.er.usgs.gov/thumbnails/fake88421.jpg'}, {u'@note': u'DOCUMENT', u'#text': u'http://pubs.usgs.gov/fs/0033-01/report.pdf'}]}, u'relatedItem': [{u'titleInfo': {u'title': u'U.S. Geological Survey World Wide Web Information'}, u'identifier': {u'#text': u'fs05503', u'@type': u'pw'}, u'originInfo': {u'dateIssued': u'2003'}, u'@type': u'succeeding', u'base_id': {u'#text': u'fake88421', u'@type': u'pw'}}, {u'titleInfo': {u'title': u'U.S. Geological Survey World Wide Web Information'}, u'identifier': {u'#text': u'fs07199', u'@type': u'pw'}, u'originInfo': {u'dateIssued': u'2370'}, u'@type': u'preceding', u'base_id': {u'#text': u'fake88421', u'@type': u'pw'}}, {u'titleInfo': {u'title': u'U.S. Geological Survey World Wide Web Information'}, u'identifier': {u'#text': u'fs03700', u'@type': u'pw'}, u'originInfo': {u'dateIssued': u'2000'}, u'@type': u'preceding', u'base_id': {u'#text': u'fake88421', u'@type': u'pw'}}]}]}}
    mock_pub_json = {'abstractHeader': 'Abstract',
                     'authorsList': [u'U.S. Geological Survey'],
                     'authorsListTyped': [{'text': u'U.S. Geological Survey',
                                           'type': 'corporation'}],
                     u'contributors': {u'authors': [{u'contributorId': 128075,
                                                     u'contributorType': {u'id': 1,
                                                                          u'text': u'Authors'},
                                                     u'corporation': True,
                                                     u'id': 532172,
                                                     u'organization': u'U.S. Geological Survey',
                                                     u'rank': 1,
                                                     u'text': u'U.S. Geological Survey',
                                                     u'usgs': False}]},
                     u'costCenters': [{u'id': 595, u'text': u'U.S. Geological Survey'}],
                     'details': [{'Publication type:': u'Report'},
                                 {'Publication Subtype:': u'USGS Numbered Series'},
                                 {'Title:': u'U.S. Geological Survey World Wide Web Information'},
                                 {'Series title:': u'Fact Sheet'},
                                 {'Series number:': u'055-03'},
                                 {'Edition:': u'Supersedes FS 037-00 & FS 033-01'},
                                 {'Year Published:': u'2003'},
                                 {'Language:': u'ENGLISH'},
                                 {'Publisher:': u'U.S. Geological Survey'},
                                 {'Publisher location:': u'Reston, VA'},
                                 {'Contributing office(s):': u'U.S. Geological Survey'},
                                 {'Description:': u'2 p.'}],
                     'displayLinks': {'Abstract': [],
                                      'Additional Report Piece': [],
                                      'Appendix': [],
                                      'Application Site': [],
                                      'Authors Website': [],
                                      'Chapter': [],
                                      'Companion Files': [],
                                      'Cover': [],
                                      'Database': [],
                                      'Dataset': [],
                                      'Digital Object Identifier': [],
                                      'Document': [{u'id': 87126,
                                                    u'linkFileType': {u'id': 1,
                                                                      u'text': u'pdf'},
                                                    u'rank': 300,
                                                    u'type': {u'id': 11, u'text': u'Document'},
                                                    u'url': u'http://pubs.usgs.gov/fs/2003/0055/report.pdf'}],
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
                                      'Sheet': [],
                                      'Spatial Data': [],
                                      'Table': [],
                                      'Thumbnail': [{u'id': 123578,
                                                     u'rank': 0,
                                                     u'type': {u'id': 24,
                                                               u'text': u'Thumbnail'},
                                                     u'url': u'http://pubs.usgs.gov/fs/2003/0055/report-thumb.jpg'}],
                                      'Version History': []},
                     u'displayToPublicDate': u'2004-04-01T01:00:00.000',
                     u'docAbstract': u'The U.S. Geological Survey (USGS) invites you to explore an earth science virtual library of digital information, publications, and data. The USGS World Wide Web sites offer an array of information that reflects scientific research and monitoring programs conducted in the areas of natural hazards, environmental resources, and cartography. This list provides gateways to access a cross section of the digital information on the USGS World Wide Web sites.',
                     u'edition': u'Supersedes FS 037-00 & FS 033-01',
                     'formattedModifiedDateTime': u'May 05, 2014 14:46:47',
                     'hasSubParts': False,
                     u'id': 53167,
                     u'indexId': u'fs05503',
                     u'interactions': [{u'id': 4,
                                        u'object': {u'id': 53167,
                                                    u'indexId': u'fs05503',
                                                    u'publicationYear': u'2003',
                                                    u'text': u'fs05503 - 2003 - U.S. Geological Survey World Wide Web Information',
                                                    u'title': u'U.S. Geological Survey World Wide Web Information'},
                                        u'predicate': u'SUPERSEDED_BY',
                                        u'subject': {u'id': 30722,
                                                     u'indexId': u'fs03301',
                                                     u'publicationYear': u'2001',
                                                     u'text': u'fs03301 - 2001 - U.S. Geological Survey World Wide Web Information',
                                                     u'title': u'U.S. Geological Survey World Wide Web Information'}},
                                       {u'id': 2,
                                        u'object': {u'id': 53167,
                                                    u'indexId': u'fs05503',
                                                    u'publicationYear': u'2003',
                                                    u'text': u'fs05503 - 2003 - U.S. Geological Survey World Wide Web Information',
                                                    u'title': u'U.S. Geological Survey World Wide Web Information'},
                                        u'predicate': u'SUPERSEDED_BY',
                                        u'subject': {u'id': 5330,
                                                     u'indexId': u'fs03700',
                                                     u'publicationYear': u'2000',
                                                     u'text': u'fs03700 - 2000 - U.S. Geological Survey World Wide Web Information',
                                                     u'title': u'U.S. Geological Survey World Wide Web Information'}},
                                       {u'id': 1,
                                        u'object': {u'id': 53167,
                                                    u'indexId': u'fs05503',
                                                    u'publicationYear': u'2003',
                                                    u'text': u'fs05503 - 2003 - U.S. Geological Survey World Wide Web Information',
                                                    u'title': u'U.S. Geological Survey World Wide Web Information'},
                                        u'predicate': u'SUPERSEDED_BY',
                                        u'subject': {u'id': 5329,
                                                     u'indexId': u'fs07199',
                                                     u'publicationYear': u'1999',
                                                     u'text': u'fs07199 - 1999 - U.S. Geological Survey World Wide Web Information',
                                                     u'title': u'U.S. Geological Survey World Wide Web Information'}},
                                       {u'id': 3,
                                        u'object': {u'id': 53167,
                                                    u'indexId': u'fs05503',
                                                    u'publicationYear': u'2003',
                                                    u'text': u'fs05503 - 2003 - U.S. Geological Survey World Wide Web Information',
                                                    u'title': u'U.S. Geological Survey World Wide Web Information'},
                                        u'predicate': u'SUPERSEDED_BY',
                                        u'subject': {u'id': 5328,
                                                     u'indexId': u'fs12196',
                                                     u'publicationYear': u'1997',
                                                     u'text': u'fs12196 - 1997 - U.S. Geological Survey World Wide Web information',
                                                     u'title': u'U.S. Geological Survey World Wide Web information'}}],
                     u'language': u'ENGLISH',
                     u'lastModifiedDate': u'2014-05-05T14:46:47.000',
                     u'links': [{u'id': 123578,
                                 u'rank': 0,
                                 u'type': {u'id': 24, u'text': u'Thumbnail'},
                                 u'url': u'http://pubs.usgs.gov/fs/2003/0055/report-thumb.jpg'},
                                {u'id': 87126,
                                 u'linkFileType': {u'id': 1, u'text': u'pdf'},
                                 u'rank': 300,
                                 u'type': {u'id': 11, u'text': u'Document'},
                                 u'url': u'http://pubs.usgs.gov/fs/2003/0055/report.pdf'}],
                     u'productDescription': u'2 p.',
                     'pubHasNoLinks': False,
                     u'publicationSubtype': {u'id': 5, u'text': u'USGS Numbered Series'},
                     u'publicationType': {u'id': 18, u'text': u'Report'},
                     u'publicationYear': u'2003',
                     u'publisher': u'U.S. Geological Survey',
                     u'publisherLocation': u'Reston, VA',
                     'relationships': {'@context': {'dc': 'http://purl.org/dc/elements/1.1/',
                                                    'rdac': 'http://rdaregistry.info/Elements/c/',
                                                    'rdaw': 'http://rdaregistry.info/Elements/w/',
                                                    'rdaw:replacedByWork': {'@type': '@id'},
                                                    'rdaw:replacementOfWork': {'@type': '@id'},
                                                    'xsd': 'http://www.w3.org/2001/XMLSchema#'},
                                       '@graph': [{'@id': u'http://127.0.0.1:5050/publication/fs05503',
                                                   '@type': 'rdac:Work',
                                                   'dc:date': '2003',
                                                   'dc:title': u'U.S. Geological Survey World Wide Web Information'},
                                                  {'@id': u'http://127.0.0.1:5050/publication/fs07199',
                                                   '@type': 'rdac:Work',
                                                   'dc:date': u'1999',
                                                   'dc:title': u'U.S. Geological Survey World Wide Web Information',
                                                   'rdaw:replacedByWork': u'http://127.0.0.1:5050/publication/fs05503'},
                                                  {'@id': u'http://127.0.0.1:5050/publication/fs03700',
                                                   '@type': 'rdac:Work',
                                                   'dc:date': u'2000',
                                                   'dc:title': u'U.S. Geological Survey World Wide Web Information',
                                                   'rdaw:replacedByWork': u'http://127.0.0.1:5050/publication/fs05503'},
                                                  {'@id': u'http://127.0.0.1:5050/publication/fs12196',
                                                   '@type': 'rdac:Work',
                                                   'dc:date': u'1997',
                                                   'dc:title': u'U.S. Geological Survey World Wide Web information',
                                                   'rdaw:replacedByWork': u'http://127.0.0.1:5050/publication/fs05503'},
                                                  {'@id': u'http://127.0.0.1:5050/publication/fs03301',
                                                   '@type': 'rdac:Work',
                                                   'dc:date': u'2001',
                                                   'dc:title': u'U.S. Geological Survey World Wide Web Information',
                                                   'rdaw:replacedByWork': u'http://127.0.0.1:5050/publication/fs05503'}]},
                     u'seriesNumber': u'055-03',
                     u'seriesTitle': {u'id': 313,
                                      u'onlineIssn': u'2327-6932',
                                      u'printIssn': u'2327-6916',
                                      u'text': u'Fact Sheet'},
                     u'text': u'fs05503 - 2003 - U.S. Geological Survey World Wide Web Information',
                     u'title': u'U.S. Geological Survey World Wide Web Information',
                     u'usgsCitation': u'U.S. Geological Survey World Wide Web Information; 2003; FS; 055-03; U.S. Geological Survey'}


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
    expected_snippet = 'U.S. Geological Survey World Wide Web information (1997)'
    assert_in(expected_snippet, world.response_content)