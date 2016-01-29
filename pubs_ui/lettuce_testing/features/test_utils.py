import httpretty
from nose.tools import assert_equal, assert_items_equal
from lettuce import *
import json
from requests import get
from pubs_ui.pubswh.utils import (pull_feed, pubdetails, getbrowsecontent, create_display_links,
                           jsonify_geojson, add_relationships_graphs, SearchPublications,
                           make_contributor_list, legacy_api_info, sort_list_of_dicts,
                           extract_related_pub_info, munge_abstract)
from pubs_ui import app

"""
pull_feed scenarios
"""
@step(r'I have created a mock xml at a mock url')
def create_mock(step):
    # enabling httpretty
    httpretty.reset()
    httpretty.enable()
    # This is a really long raw string meant to mock the type of xml we would find on the confluence wiki
    mock_xml = """<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><title>TEST_XML</title><link rel="alternate" href="https://my.usgs.gov/confluence" /><subtitle>Imitation of Confluence Syndication Feed</subtitle><id>https://my.usgs.gov/confluence</id><entry><title>Test Resources</title><link rel="alternate" href="https://my.usgs.gov/confluence/display/pubswarehouseinfo/Other+Resources" /><category term="other_resources" /><author><name>Steve K</name></author><id>tag:my.usgs.gov,2009:page-test-page</id><updated>2014-09-26T02:34:53Z</updated><published>2014-09-26T02:34:53Z</published><summary type="html">&lt;div class="feed"&gt;&lt;p&gt;Page&lt;b&gt;edited&lt;/b&gt; by&lt;a href="https://my.usgs.gov/confluence/display/~jkreft@usgs.gov"&gt;Steve K&lt;/a&gt;&lt;/p&gt;&lt;div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;padding: 10px;"&gt;&lt;h4 id="OtherResources-Ordering:"&gt;Ordering:&lt;/h4&gt;&lt;p&gt;&lt;ahref="http://www.usgs.gov/pubprod/" class="external-link" rel="nofollow"&gt; All this test text &lt;/p&gt;&lt;/div&gt;&lt;div style="padding: 10px 0;"&gt;&lt;a href="https://my.usgs.gov/confluence/display/pubswarehouseinfo/Other+Resources"&gt;View Online&lt;/a&gt;&amp;middot;&lt;ahref="https://my.usgs.gov/confluence/pages/diffpagesbyversion.action?pageId=518425134&amp;revisedVersion=3&amp;originalVersion=2"&gt;View Changes Online&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;</summary><dc:creator>Steve K</dc:creator><dc:date>2014-09-26T02:34:53Z</dc:date></entry></feed>"""
    httpretty.register_uri(httpretty.GET, "http://test_url/test", body = mock_xml)
    
@step(r'I pull_feed the fake url')
def enable_mock(step):
    world.output = pull_feed("http://test_url/test")


@step(r'I defined the output we would expect for the mock from pull_feed')
def mock_output(step):
    world.expected_output = u'<html><body><div class="feed"><div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 10px;"><h4 id="OtherResources-Ordering:">Ordering:</h4><p> All this test text </p></div></div></body></html>'

@step(r'I see that pull_feed gave the expected output')
def test_pull_feed(step):
    assert_equal(world.expected_output, world.output)
    httpretty.reset()
    httpretty.disable()

"""
pubdetails scenarios
"""
@step(r'I have some fake json pubs metadata')
def set_mock_pubs(step):
    test_url = "http://test_url/test/publication/a1"
    world.body = json.loads('{"publicationYear":"1880","publicationType":{"id":18,"text":"Report"}}')

@step(r'I find fake details with pubdetails')   
def get_pubdetails(step):
    world.output = pubdetails(world.body)
    world.expected_output = {u'publicationType': {u'text': u'Report', u'id': 18}, u'publicationYear': u'1880', 'details': [{'Publication type:': u'Report'}, {'Year Published:': u'1880'}]}

@step(r'I am returned an expected result')
def test_pubdetails(step):
    assert_equal(world.output, world.expected_output)

@step(r'I point to a real pubs url')
def first_annual_report(step):
    world.live_url = 'https://pubs.er.usgs.gov/pubs-services/publication/ar1'

@step(r'I find real details with pubdetails')
def get_first_details(step):
    r = get(world.live_url)
    json = r.json()
    world.output = len(str(pubdetails(json))) # Measure json lengths (as strings) since there is a lot of data
    world.expected_output = 2089

"""
display-link scenarios
"""
@step(r'I have a fake json full of pubs-related links')
def mock_pubs_links(step):
    world.body = json.loads('{"links":[{"id":5277443,"rank":0,"type":{"id":24,"text":"Thumbnail"},"url":"http://pubs.usgs.gov/ar/01/report-thumb.jpg"},{"id":5166317,"rank":300,"type":{"id":11,"text":"Document"},"url":"http://pubs.usgs.gov/ar/01/report.pdf","linkFileType":{"id":1,"text":"pdf"}},{"id":5344307,"rank":400,"type":{"id":17,"text":"Plate"},"url":"http://pubs.usgs.gov/ar/01/plate-1.pdf","size":"9056","linkFileType":{"id":1,"text":"pdf"}}]}')
    
@step(r'I create_display_links using the dummy list')
def display_links(step):
    world.output = create_display_links(world.body)
    world.expected_output ={'displayLinks': {'Abstract': [],
                  'Additional Report Piece': [],
                  'Appendix': [],
                  'Application Site': [],
                  'Authors Website': [],
                  'Chapter': [],
                  'Companion Files': [],
                  'Cover': [],
                  'Database': [],
                  'Digital Object Identifier': [],
                  'Document': [{u'id': 5166317,
                                u'linkFileType': {u'id': 1,
                                                  u'text': u'pdf'},
                                u'rank': 300,
                                u'type': {u'id': 11, u'text': u'Document'},
                                u'url': u'http://pubs.usgs.gov/ar/01/report.pdf'}],
                  'Errata': [],
                  'Figure': [],
                  'Illustration': [],
                  'Image': [],
                  'Index Page': [],
                  'Metadata': [],
                  'Plate': [{u'id': 5344307,
                             u'linkFileType': {u'id': 1, u'text': u'pdf'},
                             u'rank': 1,
                             u'size': u'9056',
                             'text': u'Plate 1',
                             u'type': {u'id': 17, u'text': u'Plate'},
                             u'url': u'http://pubs.usgs.gov/ar/01/plate-1.pdf'}],
                  'Project Site': [],
                  'Raw Data': [],
                  'Read Me': [],
                  'Referenced Work': [],
                  'Related Work': [],
                  'Spatial Data': [],
                  'Sheet': [],
                  'Table': [],
                  'Dataset': [],
                  'Thumbnail': [{u'id': 5277443,
                                 u'rank': 0,
                                 u'type': {u'id': 24,
                                           u'text': u'Thumbnail'},
                                 u'url': u'http://pubs.usgs.gov/ar/01/report-thumb.jpg'}],
                  'Version History': []},
                     u'links': [{u'id': 5277443,
                                 u'rank': 0,
                                 u'type': {u'id': 24, u'text': u'Thumbnail'},
                                 u'url': u'http://pubs.usgs.gov/ar/01/report-thumb.jpg'},
                                {u'id': 5166317,
                                 u'linkFileType': {u'id': 1, u'text': u'pdf'},
                                 u'rank': 300,
                                 u'type': {u'id': 11, u'text': u'Document'},
                                 u'url': u'http://pubs.usgs.gov/ar/01/report.pdf'},
                                {u'id': 5344307,
                                 u'linkFileType': {u'id': 1, u'text': u'pdf'},
                                 u'rank': 400,
                                 u'size': u'9056',
                                 u'type': {u'id': 17, u'text': u'Plate'},
                                 u'url': u'http://pubs.usgs.gov/ar/01/plate-1.pdf'}],
                    'pubHasNoLinks': False}


@step(r'I am given a list of links for use in the jinja template')
def test_links_ouput(step):
    assert_equal(world.output, world.expected_output)

@step(r"I create_display_links from the pub's response")
def live_display_links(step):
    world.output = len(create_display_links(get(world.live_url).json()))
    world.expected_output = 23 #check all necessary components are there.
"""
getbrowsecontent scenarios
"""

@step(r"I have a mockup url and body of pubs browse links")
def mockup_browse(step):
    body = r'<div id="pubs-browse-links"><ul><li><a href="browse/usgs-publications" alt="Official USGS Publications">Official USGS Publications</a></li><li><a href="browse/journals/all/" alt="Scientific Journal Articles by USGS Authors">ScientificJournal Articles by USGS Authors</a></li><li><a href="browse/other-pubs/all/" alt="Other US Government Publications">Other US Government Publications</a></li><li><a href="browse/state-local/all/" alt="State, Local, and other government publications">State, Local, and other government publications</a></li><li><a href="browse/books-reports-conference/all/" alt="Books, Reports, Conference Proceedings and other publications">Books, Reports, Conference Proceedings and other publications</a></li></ul></div><div id="pubs-browse-breadcrumbs"><a href="browse">Browse USGS Pubs Warehouse</a></div><div id="pubs-browse-header">Please select a category of interest</div>'
    world.url = "http://test_url/test/browse"
    httpretty.enable()
    httpretty.register_uri(httpretty.GET, world.url, body = body)
    world.expected_output = '{\'breadcrumbs\': [<a href="browse">Browse USGS Pubs Warehouse</a>], \'links\': [<ul><li><a alt="Official USGS Publications" href="browse/usgs-publications">Official USGS Publications</a></li><li><a alt="Scientific Journal Articles by USGS Authors" href="browse/journals/all/">ScientificJournal Articles by USGS Authors</a></li><li><a alt="Other US Government Publications" href="browse/other-pubs/all/">Other US Government Publications</a></li><li><a alt="State, Local, and other government publications" href="browse/state-local/all/">State, Local, and other government publications</a></li><li><a alt="Books, Reports, Conference Proceedings and other publications" href="browse/books-reports-conference/all/">Books, Reports, Conference Proceedings and other publications</a></li></ul>], \'header\': [u\'Please select a category of interest\']}'
@step(r"I get the links, breadcrumbs, and titles from the url")
def browse_content(step):
    world.output = str(getbrowsecontent(world.url, "browse"))
    httpretty.disable()
    httpretty.reset()

@step(r"I am returned a list for the links, breadcrumbs, and titles")
def test_content(step):
    assert_equal(world.output, world.expected_output)

@step(r"I point to a real pubs browse url")
def make_url(step):
    world.url = "http://cida-eros-pubsprod.er.usgs.gov:8080/pubs2_ui/browse"
    world.expected_output = '{\'breadcrumbs\': [u\'\\n\', <a href="browse">Browse USGS Pubs Warehouse</a>, u\'\\n\'], \'links\': [u\'\\n\', <ul>\\n<li><a alt="Official USGS Publications" href="browse/usgs-publications">Official USGS Publications</a></li>\\n<li><a alt="Scientific Journal Articles by USGS Authors" href="browse/journals/all/">Scientific Journal Articles by USGS Authors</a></li>\\n<li><a alt="Other US Government Publications" href="browse/other-pubs/all/">Other US Government Publications</a></li>\\n<li><a alt="State, Local, and other government publications" href="browse/state-local/all/">State, Local, and other government publications</a></li>\\n<li><a alt="Books, Reports, Conference Proceedings and other publications" href="browse/books-reports-conference/all/">Books, Reports, Conference Proceedings and other publications</a></li>\\n</ul>, u\'\\n\'], \'header\': [u\'Please select a category of interest\']}'

"""
manipulate links scenarios
"""
@step(r'I have a index page links that point to USGS and NGMDB')
def imitation_links_data(step):
    world.original_index_display_links = {'links': [{'id': 5396477,
            'type': {'id': 23, 'text': 'Spatial Data'},
            'url': 'http://pubs.usgs.gov/sim/3310/GIS_files'},
           {'id': 5396475,
            'type': {'id': 17, 'text': 'Plate'},
            'url': 'http://pubs.usgs.gov/sim/3310/pdf/sim3310_sheet1.pdf'},
           {'id': 5396476,
            'type': {'id': 17, 'text': 'Plate'},
            'url': 'http://pubs.usgs.gov/sim/3310/pdf/sim3310_sheet2.pdf'},
           {'id': 5396470,
            'type': {'id': 15, 'text': 'Index Page'},
            'url': 'http://pubs.usgs.gov/sim/3310/'},
           {'id': 5396470,
            'type': {'id': 15, 'text': 'Index Page'},
            'url': 'http://ngmdb.usgs.gov/sim/3310/'},
           {'id': 5396478,
            'type': {'id': 24, 'text': 'Thumbnail'},
            'url': 'http://pubs.er.usgs.gov/thumbnails/sim3310.jpg'}]}

@step(r'I manipulate the links with create display links')
def create_display_links_with_index_pages(step):
    world.displaylinks_output =create_display_links(world.original_index_display_links)
    world.expected_displaylinks_output = {'displayLinks': {'Abstract': [],
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
                  'Figure': [],
                  'Illustration': [],
                  'Image': [],
                  'Index Page': [{'id': 5396470,
                                  'rank': 1,
                                  'text': 'USGS Index Page',
                                  'type': {'id': 15, 'text': 'Index Page'},
                                  'url': 'http://pubs.usgs.gov/sim/3310/'},
                                 {'id': 5396470,
                                  'rank': 2,
                                  'text': 'National Geologic Map Database Index Page',
                                  'type': {'id': 15, 'text': 'Index Page'},
                                  'url': 'http://ngmdb.usgs.gov/sim/3310/'}],
                  'Metadata': [],
                  'Plate': [{'id': 5396475,
                             'linkFileType': {'text': 'pdf'},
                             'rank': 1,
                             'text': 'Sheet 1',
                             'type': {'id': 17, 'text': 'Plate'},
                             'url': 'http://pubs.usgs.gov/sim/3310/pdf/sim3310_sheet1.pdf'},
                            {'id': 5396476,
                             'linkFileType': {'text': 'pdf'},
                             'rank': 2,
                             'text': 'Sheet 2',
                             'type': {'id': 17, 'text': 'Plate'},
                             'url': 'http://pubs.usgs.gov/sim/3310/pdf/sim3310_sheet2.pdf'}],
                  'Project Site': [],
                  'Raw Data': [],
                  'Read Me': [],
                  'Referenced Work': [],
                  'Related Work': [],
                  'Sheet': [],
                  'Table': [],
                  'Dataset': [],
                  'Spatial Data': [{'id': 5396477,
                                    'rank': 1,
                                    'type': {'id': 23,
                                             'text': 'Spatial Data'},
                                    'url': 'http://pubs.usgs.gov/sim/3310/GIS_files'}],
                  'Thumbnail': [{'id': 5396478,
                                 'rank': 1,
                                 'type': {'id': 24, 'text': 'Thumbnail'},
                                 'url': 'http://pubs.er.usgs.gov/thumbnails/sim3310.jpg'}],
                  'Version History': []},
 'links': [{'id': 5396477,
            'type': {'id': 23, 'text': 'Spatial Data'},
            'url': 'http://pubs.usgs.gov/sim/3310/GIS_files'},
           {'id': 5396475,
            'type': {'id': 17, 'text': 'Plate'},
            'url': 'http://pubs.usgs.gov/sim/3310/pdf/sim3310_sheet1.pdf'},
           {'id': 5396476,
            'type': {'id': 17, 'text': 'Plate'},
            'url': 'http://pubs.usgs.gov/sim/3310/pdf/sim3310_sheet2.pdf'},
           {'id': 5396470,
            'type': {'id': 15, 'text': 'Index Page'},
            'url': 'http://pubs.usgs.gov/sim/3310/'},
           {'id': 5396470,
            'type': {'id': 15, 'text': 'Index Page'},
            'url': 'http://ngmdb.usgs.gov/sim/3310/'},
           {'id': 5396478,
            'type': {'id': 24, 'text': 'Thumbnail'},
            'url': 'http://pubs.er.usgs.gov/thumbnails/sim3310.jpg'}],
 'pubHasNoLinks': False}

@step(r'I get the rejiggered display links that I expect')
def test_displaylinks_output(step):
    assert_equal(world.expected_displaylinks_output, world.displaylinks_output)

"""
jsonify_geojson scenarios
"""
@step(r'we have created a fake pubs record with a geographic extents string')
def imitation_geojson(step):
    world.body = {'id': 12345, 'title':'The Title', 'indexId': 'pubIndexId', 'publicationYear':'1995', 'publicationType':'Report',
                  "geographicExtents": '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [ [ [ -72.745833,44.0625 ], [ -72.745833,44.075 ], [ -72.741667,44.075 ], [ -72.741667,44.0625 ], [ -72.745833,44.0625 ] ] ] } } ] }'}

@step(r'I make a record with parsable json')
def make_json(step):
    world.output = jsonify_geojson(world.body)
    world.expected_output = {'geographicExtents': {u'features': [{u'geometry': {u'coordinates': [[[-72.745833,
                                                                       44.0625],
                                                                      [-72.745833,
                                                                       44.075],
                                                                      [-72.741667,
                                                                       44.075],
                                                                      [-72.741667,
                                                                       44.0625],
                                                                      [-72.745833,
                                                                       44.0625]]],
                                                    u'type': u'Polygon'},
                                      'id': 'pubIndexId.base_id',
                                      u'properties': {'id': 'pubIndexId',
                                                      'info': '1995',
                                                      'title': 'The Title',
                                                      'url': app.config.get('JSON_LD_ID_BASE_URL')+'publication/pubIndexId',
                                                      'year': '1995'},
                                      u'type': u'Feature'}],
                       'properties': {'title': 'The Title'},
                       u'type': u'FeatureCollection'},
 'id': 12345,
 'indexId': 'pubIndexId',
 'publicationType': 'Report',
 'publicationYear': '1995',
 'title': 'The Title'}
@step(r'I see a record was created correctly')
def test_geojson_output(step):
    assert_equal(world.output, world.expected_output)

@step(r'we have created a fake pubs record with an invalid geographic extents string')
def imitation_bad_geojson(step):
    world.body = {'id': 12345, "geographicExtents": '{ "type": "FeatureCollection",  "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [ [ [ -72.745833,44.0625 ], [ -72.745833,44.075 ], [ -72.741667,44.075 ], [ -72.741667,44.0625 ], [ -72.745833,44.0625 ] ] ] } } ] '}

@step(r'I try to make a record with parseable json and catch an error')
def make_json(step):
    world.output = jsonify_geojson(world.body)
    world.expected_output = {'id': 12345}

@step(r'I see the record has geographicExtents dropped')
def test_geojson_output(step):
    assert_equal(world.output, world.expected_output)

"""
pub relationship scenarios
"""


@step(r'I have a mockup pubs legacy url that has a store item')
def imitation_legacy_relationships_endpoint(step):
    world.legacy_supersedes_url_base = 'http://pubs-fake.er.usgs.gov/service/citation/json/extras'
    world.legacy_supersedes_url = 'http://pubs-fake.er.usgs.gov/service/citation/json/extras?prod_id=sim3069'
    resp_data = '{ "modsCollection": { "@rowCount": "1", "mods": [{ "identifier": { "@type": "pw", "#text": "sim3069"}, "location": { "url": [{ "@note": "THUMBNAIL", "#text": "http://pubs.er.usgs.gov/thumbnails/usgs_thumb.jpg"}, { "@displayLabel": "html", "@note": "INDEX PAGE", "#text": "http://pubs.usgs.gov/sim/3069/"}] }, "product": [{ "prod_id": "sim3069", "item_no": "210862", "availability": "Y", "price": "16", "url": "http://store.usgs.gov/pubsordernow.jsp?~theme=gp&OSTORE=USGSGP&~OKCODE=STARTMATL&g_matnr=210862", "outlet": { "name": "USGS STORE"}}] }] }}'
    httpretty.enable()
    httpretty.register_uri(httpretty.GET,
                           world.legacy_supersedes_url,
                           body=resp_data,
                           content_type='application/json',
                           status=200)


@step(r'I make a dict object with the store offer information')
def use_preceding_superceding(step):
    world.preceding_superseding_dict = legacy_api_info('sim3069','http://pubs-fake.er.usgs.gov/service/citation/json/extras')
    world.expected_preceding_superseding_dict = {'offers': {'@context': {'schema': 'http://schema.org/'}, '@type': 'schema:ScholarlyArticle', 'schema:offers': {'schema:seller': {'schema:name': 'USGS Store', '@type': 'schema:Organization', 'schema:url': 'http://store.usgs.gov'}, 'schema:url': u'http://store.usgs.gov/pubsordernow.jsp?~theme=gp&OSTORE=USGSGP&~OKCODE=STARTMATL&g_matnr=210862', 'schema:price': u'16', 'schema:availability': 'schema:InStock', 'schema:priceCurrency': 'USD', '@type': 'schema:Offer'}}, 'context_item': 'sim3069'}


@step(r'I see that the store information has been listed correctly')
def test_preseding_superseding(step):
    assert_equal(world.preceding_superseding_dict, world.expected_preceding_superseding_dict)


@step(r'I have a mocked base publication record, a base url, and a mocked legacy endpoint')
def given_i_have_a_static_python_representation_of_json_data_for_a_publication_known_to_have_related_superseding_or_preceding_publications(step):
    world.sim3069_pubdata = {u'seriesNumber': u'3069', u'projection': u'Universal Transverse Mercator', u'links': [{u'url': u'http://pubs.usgs.gov/sim/3069/', u'linkFileType': {u'text': u'html', u'id': 5}, u'type': {u'text': u'Index Page', u'id': 15}, u'id': 103481, u'rank': 100}, {u'url': u'http://pubs.er.usgs.gov/thumbnails/usgs_thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 5291951, u'rank': 0}], u'indexId': u'sim3069', u'geographicExtents': u'{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [ [ [ -87.75,37.75 ], [ -87.75,38.1175 ], [ -87.36749999999999,38.1175 ], [ -87.36749999999999,37.75 ], [ -87.75,37.75 ] ] ] } } ] }', u'edition': u'-', u'isbn': u'9781411324022', u'id': 97554, u'productDescription': u'Report: iv, 20 p.; 2 Map Sheets: 41 x 37.5 inches and 42 x 38.5 inches; Downloads Directory', u'title': u'Surficial Geologic Map of the Evansville, Indiana, and Henderson, Kentucky, Area', u'editors': [], u'seriesTitle': {u'onlineIssn': u'2329-132X', u'text': u'Scientific Investigations Map', u'id': 333, u'printIssn': u'2329-1311'}, u'publisher': u'U.S. Geological Survey', u'lastModifiedDate': u'2012-02-10T00:11:55.000', u'collaboration': u'Prepared in cooperation with the Indiana, Kentucky, and Illinois State Geological Surveys', u'costCenters': [{u'text': u'Earth Surface Processes Team', u'id': 229}], u'additionalOnlineFiles': u'Y', u'scale': u'50000', u'authors': [{u'given': u'Emily M.', u'family': u'Taylor', u'text': u'Taylor, Emily M. emtaylor@usgs.gov', u'rank': 9, u'id': 302466, u'affiliation': {u'text': u'Geosciences and Environmental Change Science Center', u'id': 318}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 1240, u'email': u'emtaylor@usgs.gov', u'usgs': True}, {u'given': u'Theodore R.', u'family': u'Brandt', u'text': u'Brandt, Theodore R. tbrandt@usgs.gov', u'rank': 11, u'id': 302467, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 1267, u'email': u'tbrandt@usgs.gov', u'usgs': True}, {u'given': u'Scott C.', u'family': u'Lundstrom', u'text': u'Lundstrom, Scott C. sclundst@usgs.gov', u'rank': 2, u'id': 302468, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 2446, u'email': u'sclundst@usgs.gov', u'usgs': True}, {u'given': u'Ronald C.', u'family': u'Counts', u'text': u'Counts, Ronald C. rcounts@usgs.gov', u'rank': 3, u'id': 302469, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 5343, u'email': u'rcounts@usgs.gov', u'usgs': True}, {u'given': u'Michael L.', u'family': u'Murphy', u'text': u'Murphy, Michael L.', u'rank': 7, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 23652, u'id': 302470, u'usgs': True}, {u'given': u'Erik P.', u'family': u'Kvale', u'text': u'Kvale, Erik P.', u'rank': 10, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 29090, u'id': 302471, u'usgs': True}, {u'given': u'Wayne L.', u'family': u'Newell', u'text': u'Newell, Wayne L.', u'rank': 6, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 48538, u'id': 302472, u'usgs': True}, {u'given': u'William M.', u'suffix': u'Jr.', u'family': u'Andrews', u'text': u'Andrews, William M. Jr.', u'rank': 5, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 51406, u'id': 302473, u'usgs': True}, {u'given': u'David W.', u'family': u'Moore', u'text': u'Moore, David W.', u'rank': 1, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 63835, u'id': 302474, u'usgs': True}, {u'given': u'Mark F.', u'family': u'Thompson', u'text': u'Thompson, Mark F.', u'rank': 8, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 77625, u'id': 302475, u'usgs': True}, {u'given': u'Steven L.', u'family': u'Martin', u'text': u'Martin, Steven L.', u'rank': 4, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 78433, u'id': 302476, u'usgs': True}], u'publicationType': {u'text': u'Report', u'id': 18}, u'publicationYear': u'2009', u'language': u'ENGLISH', u'docAbstract': u"The geologic map of the Evansville, Indiana, and Henderson, Kentucky, area depicts and describes surficial deposits according to their origin and age. Unconsolidated alluvium and outwash fill the Ohio River bedrock valley and attain maximum thickness of 33-39 m under Diamond Island, Kentucky, and Griffith Slough, south of Newburgh, Indiana. The fill is chiefly unconsolidated, fine- to medium-grained, lithic quartz sand, interbedded with clay, clayey silt, silt, coarse sand, granules, and gravel. Generally, the valley fill fines upward from the buried bedrock surface: a lower part being gravelly sand to sandy gravel, a middle part mostly of sand, and a surficial veneer of silt and clay interspersed with sandy, natural levee deposits at river's edge. Beneath the unconsolidated fill are buried and discontinuous, lesser amounts of consolidated fill unconformably overlying the buried bedrock surface.\r\n\r\nMost of the glaciofluvial valley fill accumulated during the Wisconsin Episode (late Pleistocene). Other units depicted on the map include creek alluvium, slackwater lake (lacustrine) deposits, colluvium, dune sand, loess, and sparse bedrock outcrops. Creek alluvium underlies creek floodplains and consists of silt, clayey silt, and subordinate interbedded fine sand, granules, and pebbles. Lenses and beds of clay are present locally. Silty and clayey slackwater lake (lacustrine) deposits extensively underlie broad flats northeast of Evansville and around Henderson and are as thick as 28 m. Fossil wood collected from an auger hole in the lake and alluvial deposits of Little Creek, at depths of 10.6 m and 6.4 m, are dated 16,650+-50 and 11,120+-40 radiocarbon years, respectively. Fossil wood collected from lake sediment 16 m below the surface in lake sediment was dated 33,100+-590 radiocarbon years.\r\n\r\nCovering the hilly bedrock upland is loess (Qel), 3-7.5 m thick in Indiana and 9-15 m thick in Kentucky, deposited about 22,000-12,000 years before present. Most mapped surficial deposits in the quadrangle are probably no older than about 55,000 years. Lithologic logs, shear-wave velocities, and other cone penetrometer data are used to interpret depositional environments and geologic history of the surficial deposits.\r\n\r\nThis map, which includes an area of slightly more than seven 7.5-minute quadrangles, serves several purposes. It is a tool for assessing seismic and flood hazards of a major urban area; aids urban planning; conveys geologic history; and locates aggregate resources. The map was produced concurrently with research by seismologists to determine places where the surficial deposits may tend to liquefy and (or) to amplify ground motions during strong earthquakes. Such hazardous responses to shaking are related to the characteristics of the geologic materials and topographic position, which the geologic map depicts. The geologic map is an element in the cooperative seismic hazard assessment program among the States of Indiana, Kentucky, and Illinois and the U.S. Geological Survey, funded by the National Earthquake Hazards Reduction Program and National Cooperative Geologic Mapping Program of the U.S. Geological Survey.", u'displayToPublicDate': u'2009-05-22T00:00:00.000', u'publicationSubtype': {u'text': u'USGS Numbered Series', u'id': 5}, u'usgsCitation': u'Surficial Geologic Map of the Evansville, Indiana, and Henderson, Kentucky, Area; 2009; SIM; 3069; Moore, David W.; Lundstrom, Scott C.; Counts, Ronald C.; Martin, Steven L.; Andrews, William M., Jr.; Newell, Wayne L.; Murphy, Michael L.; Thompson, Mark F.; Taylor, Emily M.; Kvale, Erik P.; Brandt, Theodore R.'}
    world.supersede_url_root = 'http://pubs.er.usgs.gov'


@step(r'I pass those store variables to add_relationships_graphs')
def add_supersede_pubs(step):
    world.sim3069_pubdata_with_offers = add_relationships_graphs(world.sim3069_pubdata,
                                                              world.legacy_supersedes_url_base,
                                                              'http://pubs.er.usgs.gov/')
    httpretty.reset()
    httpretty.disable()

    #new record with relationships in it
    world.expected_sim3069_data_with_offers = {u'seriesNumber': u'3069', u'projection': u'Universal Transverse Mercator', u'links': [{u'url': u'http://pubs.usgs.gov/sim/3069/', u'linkFileType': {u'text': u'html', u'id': 5}, u'type': {u'text': u'Index Page', u'id': 15}, u'id': 103481, u'rank': 100}, {u'url': u'http://pubs.er.usgs.gov/thumbnails/usgs_thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 5291951, u'rank': 0}], u'indexId': u'sim3069', u'geographicExtents': u'{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [ [ [ -87.75,37.75 ], [ -87.75,38.1175 ], [ -87.36749999999999,38.1175 ], [ -87.36749999999999,37.75 ], [ -87.75,37.75 ] ] ] } } ] }', u'edition': u'-', u'isbn': u'9781411324022', u'id': 97554, u'productDescription': u'Report: iv, 20 p.; 2 Map Sheets: 41 x 37.5 inches and 42 x 38.5 inches; Downloads Directory', u'title': u'Surficial Geologic Map of the Evansville, Indiana, and Henderson, Kentucky, Area', u'editors': [], 'offers': {'@context': {'schema': 'http://schema.org/'}, '@type': 'schema:ScholarlyArticle', 'schema:offers': {'schema:seller': {'schema:name': 'USGS Store', '@type': 'schema:Organization', 'schema:url': 'http://store.usgs.gov'}, 'schema:url': u'http://store.usgs.gov/pubsordernow.jsp?~theme=gp&OSTORE=USGSGP&~OKCODE=STARTMATL&g_matnr=210862', 'schema:price': u'16', 'schema:availability': 'schema:InStock', 'schema:priceCurrency': 'USD', '@type': 'schema:Offer'}}, u'seriesTitle': {u'onlineIssn': u'2329-132X', u'text': u'Scientific Investigations Map', u'id': 333, u'printIssn': u'2329-1311'}, u'publisher': u'U.S. Geological Survey', u'lastModifiedDate': u'2012-02-10T00:11:55.000', u'collaboration': u'Prepared in cooperation with the Indiana, Kentucky, and Illinois State Geological Surveys', u'costCenters': [{u'text': u'Earth Surface Processes Team', u'id': 229}], u'additionalOnlineFiles': u'Y', u'scale': u'50000', u'authors': [{u'given': u'Emily M.', u'family': u'Taylor', u'text': u'Taylor, Emily M. emtaylor@usgs.gov', u'rank': 9, u'id': 302466, u'affiliation': {u'text': u'Geosciences and Environmental Change Science Center', u'id': 318}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 1240, u'email': u'emtaylor@usgs.gov', u'usgs': True}, {u'given': u'Theodore R.', u'family': u'Brandt', u'text': u'Brandt, Theodore R. tbrandt@usgs.gov', u'rank': 11, u'id': 302467, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 1267, u'email': u'tbrandt@usgs.gov', u'usgs': True}, {u'given': u'Scott C.', u'family': u'Lundstrom', u'text': u'Lundstrom, Scott C. sclundst@usgs.gov', u'rank': 2, u'id': 302468, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 2446, u'email': u'sclundst@usgs.gov', u'usgs': True}, {u'given': u'Ronald C.', u'family': u'Counts', u'text': u'Counts, Ronald C. rcounts@usgs.gov', u'rank': 3, u'id': 302469, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 5343, u'email': u'rcounts@usgs.gov', u'usgs': True}, {u'given': u'Michael L.', u'family': u'Murphy', u'text': u'Murphy, Michael L.', u'rank': 7, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 23652, u'id': 302470, u'usgs': True}, {u'given': u'Erik P.', u'family': u'Kvale', u'text': u'Kvale, Erik P.', u'rank': 10, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 29090, u'id': 302471, u'usgs': True}, {u'given': u'Wayne L.', u'family': u'Newell', u'text': u'Newell, Wayne L.', u'rank': 6, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 48538, u'id': 302472, u'usgs': True}, {u'given': u'William M.', u'suffix': u'Jr.', u'family': u'Andrews', u'text': u'Andrews, William M. Jr.', u'rank': 5, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 51406, u'id': 302473, u'usgs': True}, {u'given': u'David W.', u'family': u'Moore', u'text': u'Moore, David W.', u'rank': 1, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 63835, u'id': 302474, u'usgs': True}, {u'given': u'Mark F.', u'family': u'Thompson', u'text': u'Thompson, Mark F.', u'rank': 8, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 77625, u'id': 302475, u'usgs': True}, {u'given': u'Steven L.', u'family': u'Martin', u'text': u'Martin, Steven L.', u'rank': 4, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 78433, u'id': 302476, u'usgs': True}], u'publicationType': {u'text': u'Report', u'id': 18}, u'publicationYear': u'2009', u'language': u'ENGLISH', u'docAbstract': u"The geologic map of the Evansville, Indiana, and Henderson, Kentucky, area depicts and describes surficial deposits according to their origin and age. Unconsolidated alluvium and outwash fill the Ohio River bedrock valley and attain maximum thickness of 33-39 m under Diamond Island, Kentucky, and Griffith Slough, south of Newburgh, Indiana. The fill is chiefly unconsolidated, fine- to medium-grained, lithic quartz sand, interbedded with clay, clayey silt, silt, coarse sand, granules, and gravel. Generally, the valley fill fines upward from the buried bedrock surface: a lower part being gravelly sand to sandy gravel, a middle part mostly of sand, and a surficial veneer of silt and clay interspersed with sandy, natural levee deposits at river's edge. Beneath the unconsolidated fill are buried and discontinuous, lesser amounts of consolidated fill unconformably overlying the buried bedrock surface.\r\n\r\nMost of the glaciofluvial valley fill accumulated during the Wisconsin Episode (late Pleistocene). Other units depicted on the map include creek alluvium, slackwater lake (lacustrine) deposits, colluvium, dune sand, loess, and sparse bedrock outcrops. Creek alluvium underlies creek floodplains and consists of silt, clayey silt, and subordinate interbedded fine sand, granules, and pebbles. Lenses and beds of clay are present locally. Silty and clayey slackwater lake (lacustrine) deposits extensively underlie broad flats northeast of Evansville and around Henderson and are as thick as 28 m. Fossil wood collected from an auger hole in the lake and alluvial deposits of Little Creek, at depths of 10.6 m and 6.4 m, are dated 16,650+-50 and 11,120+-40 radiocarbon years, respectively. Fossil wood collected from lake sediment 16 m below the surface in lake sediment was dated 33,100+-590 radiocarbon years.\r\n\r\nCovering the hilly bedrock upland is loess (Qel), 3-7.5 m thick in Indiana and 9-15 m thick in Kentucky, deposited about 22,000-12,000 years before present. Most mapped surficial deposits in the quadrangle are probably no older than about 55,000 years. Lithologic logs, shear-wave velocities, and other cone penetrometer data are used to interpret depositional environments and geologic history of the surficial deposits.\r\n\r\nThis map, which includes an area of slightly more than seven 7.5-minute quadrangles, serves several purposes. It is a tool for assessing seismic and flood hazards of a major urban area; aids urban planning; conveys geologic history; and locates aggregate resources. The map was produced concurrently with research by seismologists to determine places where the surficial deposits may tend to liquefy and (or) to amplify ground motions during strong earthquakes. Such hazardous responses to shaking are related to the characteristics of the geologic materials and topographic position, which the geologic map depicts. The geologic map is an element in the cooperative seismic hazard assessment program among the States of Indiana, Kentucky, and Illinois and the U.S. Geological Survey, funded by the National Earthquake Hazards Reduction Program and National Cooperative Geologic Mapping Program of the U.S. Geological Survey.", u'displayToPublicDate': u'2009-05-22T00:00:00.000', u'publicationSubtype': {u'text': u'USGS Numbered Series', u'id': 5}, u'usgsCitation': u'Surficial Geologic Map of the Evansville, Indiana, and Henderson, Kentucky, Area; 2009; SIM; 3069; Moore, David W.; Lundstrom, Scott C.; Counts, Ronald C.; Martin, Steven L.; Andrews, William M., Jr.; Newell, Wayne L.; Murphy, Michael L.; Thompson, Mark F.; Taylor, Emily M.; Kvale, Erik P.; Brandt, Theodore R.'}


@step(r'The offers portion of the pub record should contain what I expect')
def test_relationship_output(step):
    assert_equal(world.sim3069_pubdata_with_offers["offers"], world.expected_sim3069_data_with_offers["offers"])

"""
test author list scenarios
"""
@step(r'we have imitated the authors data we would see from pubs')
def make_lists(step):
    world.authors = {'authors': [
                                {'given': 'apple', 'family': 'orange', 'rank': 1, 'corporation': False},
                                {'given': 'mango', 'family': 'grape', 'rank': 2, 'corporation': False}
                                ]
                    }
    world.organization = {'authors': [
                                     {'corporation': True, 'organization': 'A Local Government Agency', 'rank': 1},
                                     {'corporation': True, 'organization': 'Another Local Agency', 'rank': 2}
                                     ]
                         }
    world.mixed = {'authors': [
                              {'given': 'apple', 'family': 'orange', 'rank': 1, 'corporation': False},
                              {'corporation': True, 'organization': 'A Local Government Agency', 'rank': 2},
                              {'given': 'mango', 'family': 'grape', 'rank': 2, 'corporation': False}
                              ]
                  }
@step(r'I make a list with only authors')
def authors_list(step):
    world.result = make_contributor_list(world.authors['authors'])
    world.expected = ['apple orange', 'mango grape']

@step(r'I see that the list was made correctly')
def test_list(step):
    assert_equal(world.result, world.expected)

@step(r'I make a list with only organizations')
def organizations_list(step):
    world.result = make_contributor_list(world.organization['authors'])
    world.expected = ['A Local Government Agency', 'Another Local Agency']

@step(r'I make a list with both authors and organizations')
def mixed_list(step):
    world.result = make_contributor_list(world.mixed['authors'])
    world.expected = ['apple orange', 'A Local Government Agency', 'mango grape']

"""
search publications scenarios
"""
@step(r'we have created a fake url and mocked pubs responses')
def imitation_pubs(step):
    world.search_url = 'https://pubs-fake.er.usgs.gov/pubs-services/publication/'
    resp_data = {u'records': [{u'links': [{u'url': u'http://pubs.er.usgs.gov/thumbnails/outside_thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 659360409, u'rank': 1}], u'indexId': u'70135619', u'geographicExtents': u'{\n  "type": "FeatureCollection",\n  "features": [\n    {\n      "type": "Feature",\n      "properties": {},\n      "geometry": {\n        "type": "Polygon",\n        "coordinates": [\n          [\n            [\n              -76.2890625,\n              37.900865092570065\n            ],\n            [\n              -75.6353759765625,\n              38.00049145082287\n            ],\n            [\n              -76.0089111328125,\n              36.923547681089296\n            ],\n            [\n              -76.3934326171875,\n              37.00255267215955\n            ],\n            [\n              -76.475830078125,\n              37.44433544620035\n            ],\n            [\n              -76.2890625,\n              37.900865092570065\n            ]\n          ]\n        ]\n      }\n    }\n  ]\n}', u'startPage': u'127', u'id': 70135619, u'productDescription': u'12 p.', u'contributors': {u'authors': [{u'given': u'Karen C.', u'family': u'Rice', u'text': u'Rice, Karen C. kcrice@usgs.gov', u'rank': 1, u'id': 527150, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 1998, u'email': u'kcrice@usgs.gov', u'usgs': True}, {u'given': u'John D.', u'family': u'Jastram', u'text': u'Jastram, John D. jdjastra@usgs.gov', u'rank': 2, u'id': 527149, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 3531, u'email': u'jdjastra@usgs.gov', u'usgs': True}]}, u'title': u'Rising air and stream-water temperatures in Chesapeake Bay region, USA', u'state': u'Virginia', u'onlineOnly': u'N', u'issue': u'1-2', u'seriesTitle': {u'text': u'Climatic Change', u'id': 1252}, u'endPage': u'138', u'publisher': u'Springer', u'lastModifiedDate': u'2014-12-15T11:56:43.000', u'costCenters': [{u'text': u'Virginia Water Science Center', u'id': 614}], u'additionalOnlineFiles': u'N', u'volume': u'128', u'ipdsId': u'IP-045035', u'otherGeospatial': u'Chesapeake Bay', u'publicationType': {u'text': u'Article', u'id': 2}, u'publicationYear': u'2015', u'doi': u'10.1007/s10584-014-1295-9', u'language': u'English', u'country': u'United States', u'docAbstract': u'<p><span>Monthly mean air temperature (AT) at 85 sites and instantaneous stream-water temperature (WT) at 129 sites for 1960&ndash;2010 are examined for the mid-Atlantic region, USA. Temperature anomalies for two periods, 1961&ndash;1985 and 1985&ndash;2010, relative to the climate normal period of 1971&ndash;2000, indicate that the latter period was statistically significantly warmer than the former for both mean AT and WT. Statistically significant temporal trends across the region of 0.023&nbsp;&deg;C per year for AT and 0.028&nbsp;&deg;C per year for WT are detected using simple linear regression. Sensitivity analyses show that the irregularly sampled WT data are appropriate for trend analyses, resulting in conservative estimates of trend magnitude. Relations between 190 landscape factors and significant trends in AT-WT relations are examined using principal components analysis. Measures of major dams and deciduous forest are correlated with WT increasing slower than AT, whereas agriculture in the absence of major dams is correlated with WT increasing faster than AT. Increasing WT trends are detected despite increasing trends in streamflow in the northern part of the study area. Continued warming of contributing streams to Chesapeake Bay likely will result in shifts in distributions of aquatic biota and contribute to worsened eutrophic conditions in the bay and its estuaries.</span></p>', u'displayToPublicDate': u'2014-12-15T11:45:00.000', u'publicationSubtype': {u'text': u'Journal Article', u'id': 10}, u'usgsCitation': u'Rice, K.C., and Jastram, J.D., 2014, Rising air and stream-water temperatures in Chesapeake Bay region, USA:  Climatic Change: Volume 128, Issue 1-2 (2015), Page 127-138, doi:10.1007/s10584-014-1295-9.'}, {u'links': [{u'url': u'http://pubs.er.usgs.gov/thumbnails/outside_thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 659570704}], u'indexId': u'70135252', u'startPage': u'397', u'id': 70135252, u'productDescription': u'23 p.', u'contributors': {u'authors': [{u'given': u'Scott L.', u'family': u'Collins', u'text': u'Collins, Scott L.', u'rank': 1, u'affiliation': {u'text': u'Department of Biology, University of New Mexico', u'id': 7000}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 71307, u'id': 526983, u'usgs': False}, {u'given': u'Jayne', u'family': u'Belnap', u'text': u'Belnap, Jayne jayne_belnap@usgs.gov', u'rank': 2, u'id': 526982, u'affiliation': {u'text': u'Southwest Biological Science Center', u'id': 568}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 1332, u'email': u'jayne_belnap@usgs.gov', u'usgs': True}, {u'given': u'N.B.', u'family': u'Grimm', u'text': u'Grimm, N.B.', u'rank': 3, u'affiliation': {u'text': u'Arizona State University', u'id': 6607}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 54164, u'id': 526984, u'usgs': False}, {u'given': u'J.A.', u'family': u'Rudgers', u'text': u'Rudgers, J.A.', u'rank': 4, u'affiliation': {u'text': u'Department of Biology, University of New Mexico, Albuquerque, NM 87131 USA', u'id': 7164}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 127832, u'id': 526991, u'usgs': False}, {u'given': u'C.N.', u'family': u'Dahm', u'text': u'Dahm, C.N.', u'rank': 5, u'affiliation': {u'text': u'Department of Biology, University of New Mexico', u'id': 7000}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 22730, u'id': 526985, u'usgs': False}, {u'given': u'P. D.', u'family': u"D'Odorico", u'text': u"D'Odorico, P. D.", u'rank': 6, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 56528, u'id': 526992, u'usgs': True}, {u'given': u'M.', u'family': u'Litvak', u'text': u'Litvak, M.', u'rank': 7, u'affiliation': {u'text': u'Department of Biology, University of New Mexico, Albuquerque, NM 87131 USA', u'id': 7164}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 127830, u'id': 526986, u'usgs': False}, {u'given': u'D.O.', u'family': u'Natvig', u'text': u'Natvig, D.O.', u'rank': 8, u'affiliation': {u'text': u'Department of Biology, University of New Mexico, Albuquerque, NM 87131 USA', u'id': 7164}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 127831, u'id': 526987, u'usgs': False}, {u'given': u'Douglas C.', u'family': u'Peters', u'text': u'Peters, Douglas C.', u'rank': 9, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 106797, u'id': 526993, u'usgs': True}, {u'given': u'W.T.', u'family': u'Pockman', u'text': u'Pockman, W.T.', u'rank': 10, u'affiliation': {u'text': u'Department of Biology, University of New Mexico, Albuquerque, NM 87131 USA', u'id': 7164}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 57260, u'id': 526988, u'usgs': False}, {u'given': u'R.L.', u'family': u'Sinsabaugh', u'text': u'Sinsabaugh, R.L.', u'rank': 11, u'affiliation': {u'text': u'Department of Biology, University of New Mexico, Albuquerque, NM 87131 USA', u'id': 7164}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 30784, u'id': 526989, u'usgs': False}, {u'given': u'B.O.', u'family': u'Wolf', u'text': u'Wolf, B.O.', u'rank': 12, u'affiliation': {u'text': u'Department of Biology, University of New Mexico, Albuquerque, NM 87131 USA', u'id': 7164}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 87897, u'id': 526990, u'usgs': False}]}, u'title': u'A multiscale, hierarchical model of pulse dynamics in arid-land ecosystems', u'onlineOnly': u'N', u'seriesTitle': {u'text': u'Annual Review of Ecology, Evolution and Systematics', u'id': 808}, u'endPage': u'419', u'publisher': u'Annual Reviews', u'lastModifiedDate': u'2014-12-15T11:01:09.000', u'costCenters': [{u'text': u'Southwest Biological Science Center', u'id': 568}], u'additionalOnlineFiles': u'N', u'volume': u'45', u'ipdsId': u'IP-056887', u'publicationType': {u'text': u'Article', u'id': 2}, u'publicationYear': u'2014', u'doi': u'10.1146/annurev-ecolsys-120213-091650', u'language': u'English', u'docAbstract': u'<p><span>Ecological processes in arid lands are often described by the pulse-reserve paradigm, in which rain events drive biological activity until moisture is depleted, leaving a reserve. This paradigm is frequently applied to processes stimulated by one or a few precipitation events within a growing season. Here we expand the original framework in time and space and include other pulses that interact with rainfall. This new hierarchical pulse-dynamics framework integrates space and time through pulse-driven exchanges, interactions, transitions, and transfers that occur across individual to multiple pulses extending from micro to watershed scales. Climate change will likely alter the size, frequency, and intensity of precipitation pulses in the future, and arid-land ecosystems are known to be highly sensitive to climate variability. Thus, a more comprehensive understanding of arid-land pulse dynamics is needed to determine how these ecosystems will respond to, and be shaped by, increased climate variability.</span></p>', u'displayToPublicDate': u'2014-12-15T12:00:00.000', u'publicationSubtype': {u'text': u'Journal Article', u'id': 10}, u'usgsCitation': u'Collins, S.L., Belnap, J., Grimm, N.B., Rudgers, J.A., Dahm, C.N., D\u2019Odorico, P., Litvak, M., Natvig, D.O., Peters, D.C., Pockman, W.T., Sinsabaugh, R.L., and Wolf, B.O., 2014, A multiscale, hierarchical model of pulse dynamics in arid-land ecosystems:  Annual Review of Ecology, Evolution, and Systematics, vol. 45, p. 397-419, http://dx.doi.org/10.1146/annurev-ecolsys-120213-091650.'}, {u'links': [{u'url': u'http://pubs.er.usgs.gov/thumbnails/outside_thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 659360410}], u'indexId': u'70135422', u'startPage': u'343', u'id': 70135422, u'productDescription': u'11 p.', u'contributors': {u'authors': [{u'given': u'Stephen R.', u'family': u'Hinkle', u'text': u'Hinkle, Stephen R. srhinkle@usgs.gov', u'rank': 1, u'id': 527120, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 1171, u'email': u'srhinkle@usgs.gov', u'usgs': True}, {u'given': u'Anthony J.', u'family': u'Tesoriero', u'text': u'Tesoriero, Anthony J.', u'rank': 2, u'affiliation': {u'text': u'Oregon Water Science Center', u'id': 518}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 40207, u'id': 536673, u'usgs': True}]}, u'title': u'Nitrogen speciation and trends, and prediction of denitrification extent, in shallow US groundwater', u'onlineOnly': u'N', u'seriesTitle': {u'text': u'Journal of Hydrology', u'id': 2342}, u'endPage': u'353', u'publisher': u'Elsevier', u'lastModifiedDate': u'2014-12-15T10:46:55.000', u'costCenters': [{u'text': u'Oregon Water Science Center', u'id': 518}], u'additionalOnlineFiles': u'N', u'volume': u'509', u'ipdsId': u'IP-028945', u'publicationType': {u'text': u'Article', u'id': 2}, u'publicationYear': u'2014', u'doi': u'10.1016/j.jhydrol.2013.11.048', u'language': u'English', u'country': u'United States', u'docAbstract': u'<p><span>Uncertainties surrounding nitrogen cycling complicate assessments of the environmental effects of nitrogen use and our understanding of the global carbon&ndash;nitrogen cycle. In this paper, we synthesize data from 877 ambient-monitoring wells across the US to frame broad patterns of nitrogen speciation and trends. At these sites, groundwater frequently contains substantial co-occurring NO</span><sub>3</sub><sup>&minus;</sup><span>&nbsp;and XSN</span><sub>2</sub><span>&nbsp;(N</span><sub>2</sub><span>&nbsp;from denitrification), reflecting active/ongoing denitrification and/or a mixture of undenitrified and denitrified groundwater. NO</span><sub>3</sub><sup>&minus;</sup><span>&nbsp;and NH</span><sub>4</sub><sup>+</sup><span>&nbsp;essentially do not co-occur, indicating that the dominant source of NH</span><sub>4</sub><sup>+</sup><span>&nbsp;at these sites likely is not dissimilatory reduction of NO</span><sub>3</sub><sup>&minus;</sup><span>&nbsp;to NH</span><sub>4</sub><sup>+</sup><span>. Positive correlations of NH</span><sub>4</sub><sup>+</sup><span>&nbsp;with apparent age, CH</span><sub>4</sub><span>, dissolved organic carbon, and indicators of reduced conditions are consistent with NH</span><sub>4</sub><sup>+</sup><span>&nbsp;mobilization from degradation of aquifer organic matter and contraindicate an anthropogenic source of NH</span><sub>4</sub><sup>+</sup><span>&nbsp;for most sites. Glacial aquifers and eastern sand and gravel aquifers generally have lower proportions of NO</span><sub>3</sub><sup>&minus;</sup><span>&nbsp;and greater proportions of XSN</span><sub>2</sub><span>&nbsp;than do fractured rock and karst aquifers and western sand and gravel aquifers. NO</span><sub>3</sub><sup>&minus;</sup><span>&nbsp;dominates in the youngest groundwater, but XSN</span><sub>2</sub><span>&nbsp;increases as residence time increases. Temporal patterns of nitrogen speciation and concentration reflect (1) changing NO</span><sub>3</sub><sup>&minus;</sup><span>&nbsp;loads over time, (2) groundwater residence-time controls on NH</span><sub>4</sub><sup>+</sup><span>&nbsp;mobilization from solid phases, and (3) groundwater residence-time controls on denitrification. A simple classification tree using readily available variables (a national coverage of soil water depth, generalized geology) or variables reasonably estimated in many aquifers (residence time) identifies categorical denitrification extent (&lt;10%, 10&ndash;50%, and&nbsp;&gt;50%) with 79% accuracy in an independent testing set, demonstrating a predictive application based on the interconnected effects of redox, geology, and residence time.</span></p>', u'displayToPublicDate': u'2014-12-15T11:45:00.000', u'publicationSubtype': {u'text': u'Journal Article', u'id': 10}, u'usgsCitation': u'Hinkle, S.R., and Tesoriero, A.J., 2014, Nitrogen speciation and trends, and prediction of denitrification extent, in shallow US groundwater: Journal of Hydrology, v. 509, p. 343-353.'}, {u'links': [{u'url': u'http://pubs.er.usgs.gov/thumbnails/outside_thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 659063549}], u'indexId': u'70135620', u'geographicExtents': u'{\n  "type": "FeatureCollection",\n  "features": [\n    {\n      "type": "Feature",\n      "properties": {},\n      "geometry": {\n        "type": "Polygon",\n        "coordinates": [\n          [\n            [\n              -114.10400390625,\n              42.01665183556825\n            ],\n            [\n              -110.98388671874999,\n              42.01665183556825\n            ],\n            [\n              -111.02783203125,\n              41.0130657870063\n            ],\n            [\n              -108.91845703124999,\n              41.04621681452063\n            ],\n            [\n              -109.0283203125,\n              36.98500309285596\n            ],\n            [\n              -113.99414062499999,\n              37.00255267215955\n            ],\n            [\n              -114.10400390625,\n              42.01665183556825\n            ]\n          ]\n        ]\n      }\n    }\n  ]\n}', u'edition': u'Online First', u'id': 70135620, u'contributors': {u'authors': [{u'given': u'Victor M.', u'family': u'Heilweil', u'text': u'Heilweil, Victor M. heilweil@usgs.gov', u'rank': 1, u'id': 527151, u'affiliation': {u'text': u'Utah Water Science Center', u'id': 610}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 837, u'email': u'heilweil@usgs.gov', u'usgs': True}, {u'given': u'Jerome', u'family': u'Benoit', u'text': u'Benoit, Jerome', u'rank': 2, u'affiliation': {u'text': u'\xc9cole Nationale du Genie de l\u2019Eau et de l\u2019Environnement de Strasbourg', u'id': 7174}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 128458, u'id': 527153, u'usgs': False}, {u'given': u'Richard W.', u'family': u'Healy', u'text': u'Healy, Richard W. rwhealy@usgs.gov', u'rank': 3, u'id': 527152, u'affiliation': {u'text': u'National Research Program - Central Branch', u'id': 5044}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 658, u'email': u'rwhealy@usgs.gov', u'usgs': True}]}, u'title': u'Variably-saturated groundwater modeling for optimizing managed aquifer recharge using trench infiltration', u'state': u'Utah', u'onlineOnly': u'N', u'seriesTitle': {u'text': u'Hydrological Processes', u'id': 1924}, u'publisher': u'Wiley', u'lastModifiedDate': u'2014-12-15T10:38:21.000', u'costCenters': [{u'text': u'Utah Water Science Center', u'id': 610}], u'additionalOnlineFiles': u'N', u'ipdsId': u'IP-053219', u'publicationType': {u'text': u'Article', u'id': 2}, u'publicationYear': u'2014', u'doi': u'10.1002/hyp.10413', u'language': u'English', u'country': u'United States', u'docAbstract': u'<p><span>Spreading-basin methods have resulted in more than 130 million cubic meters of recharge to the unconfined Navajo Sandstone of southern Utah in the past decade, but infiltration rates have slowed in recent years because of reduced hydraulic gradients and clogging. Trench infiltration is a promising alternative technique for increasing recharge and minimizing evaporation. This paper uses a variably saturated flow model to further investigate the relative importance of the following variables on rates of trench infiltration to unconfined aquifers: saturated hydraulic conductivity, trench spacing and dimensions, initial water-table depth, alternate wet/dry periods, and number of parallel trenches. Modeling results showed (1) increased infiltration with higher hydraulic conductivity, deeper initial water tables, and larger spacing between parallel trenches, (2) deeper or wider trenches do not substantially increase infiltration, (3) alternating wet/dry periods result in less overall infiltration than keeping the trenches continuously full, and (4) larger numbers of parallel trenches within a fixed area increases infiltration but with a diminishing effect as trench spacing becomes tighter. An empirical equation for estimating expected trench infiltration rates as a function of hydraulic conductivity and initial water-table depth was derived and can be used for evaluating feasibility of trench infiltration in other hydrogeologic settings</span></p>', u'displayToPublicDate': u'2014-12-15T11:30:00.000', u'publicationSubtype': {u'text': u'Journal Article', u'id': 10}}], u'pageNumber': None, u'pageRowStart': u'0', u'pageSize': u'15', u'recordCount': 4}
    httpretty.enable()
    httpretty.register_uri(httpretty.GET,
                           world.search_url,
                           body=str(json.dumps(resp_data)),
                           content_type='application/json',
                           status=200)

@step(r'I search through the publications')
def search_pubs(step):
    test_params = {'q': 'some_state'}
    world.response = SearchPublications(world.search_url).get_pubs_search_results(test_params)
    world.expected_return_content = {u'records': [{u'links': [{u'url': u'http://pubs.er.usgs.gov/thumbnails/outside_thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 659360409, u'rank': 1}], u'indexId': u'70135619', u'geographicExtents': u'{\n  "type": "FeatureCollection",\n  "features": [\n    {\n      "type": "Feature",\n      "properties": {},\n      "geometry": {\n        "type": "Polygon",\n        "coordinates": [\n          [\n            [\n              -76.2890625,\n              37.900865092570065\n            ],\n            [\n              -75.6353759765625,\n              38.00049145082287\n            ],\n            [\n              -76.0089111328125,\n              36.923547681089296\n            ],\n            [\n              -76.3934326171875,\n              37.00255267215955\n            ],\n            [\n              -76.475830078125,\n              37.44433544620035\n            ],\n            [\n              -76.2890625,\n              37.900865092570065\n            ]\n          ]\n        ]\n      }\n    }\n  ]\n}', 'authorsList': [u'Karen C. Rice', u'John D. Jastram'], u'startPage': u'127', u'id': 70135619, u'productDescription': u'12 p.', u'contributors': {u'authors': [{u'given': u'Karen C.', u'family': u'Rice', u'text': u'Rice, Karen C. kcrice@usgs.gov', u'rank': 1, u'id': 527150, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 1998, u'email': u'kcrice@usgs.gov', u'usgs': True}, {u'given': u'John D.', u'family': u'Jastram', u'text': u'Jastram, John D. jdjastra@usgs.gov', u'rank': 2, u'id': 527149, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 3531, u'email': u'jdjastra@usgs.gov', u'usgs': True}]}, u'title': u'Rising air and stream-water temperatures in Chesapeake Bay region, USA', u'state': u'Virginia', u'onlineOnly': u'N', u'issue': u'1-2', u'seriesTitle': {u'text': u'Climatic Change', u'id': 1252}, u'endPage': u'138', u'publisher': u'Springer', u'lastModifiedDate': u'2014-12-15T11:56:43.000', u'costCenters': [{u'text': u'Virginia Water Science Center', u'id': 614}], u'additionalOnlineFiles': u'N', u'volume': u'128', u'ipdsId': u'IP-045035', u'otherGeospatial': u'Chesapeake Bay', u'publicationType': {u'text': u'Article', u'id': 2}, u'publicationYear': u'2015', u'doi': u'10.1007/s10584-014-1295-9', u'language': u'English', u'country': u'United States', u'docAbstract': u'<p><span>Monthly mean air temperature (AT) at 85 sites and instantaneous stream-water temperature (WT) at 129 sites for 1960&ndash;2010 are examined for the mid-Atlantic region, USA. Temperature anomalies for two periods, 1961&ndash;1985 and 1985&ndash;2010, relative to the climate normal period of 1971&ndash;2000, indicate that the latter period was statistically significantly warmer than the former for both mean AT and WT. Statistically significant temporal trends across the region of 0.023&nbsp;&deg;C per year for AT and 0.028&nbsp;&deg;C per year for WT are detected using simple linear regression. Sensitivity analyses show that the irregularly sampled WT data are appropriate for trend analyses, resulting in conservative estimates of trend magnitude. Relations between 190 landscape factors and significant trends in AT-WT relations are examined using principal components analysis. Measures of major dams and deciduous forest are correlated with WT increasing slower than AT, whereas agriculture in the absence of major dams is correlated with WT increasing faster than AT. Increasing WT trends are detected despite increasing trends in streamflow in the northern part of the study area. Continued warming of contributing streams to Chesapeake Bay likely will result in shifts in distributions of aquatic biota and contribute to worsened eutrophic conditions in the bay and its estuaries.</span></p>', u'displayToPublicDate': u'2014-12-15T11:45:00.000', u'publicationSubtype': {u'text': u'Journal Article', u'id': 10}, 'authorsListTyped': [{'text': u'Karen C. Rice', 'type': 'person'}, {'text': u'John D. Jastram', 'type': 'person'}], u'usgsCitation': u'Rice, K.C., and Jastram, J.D., 2014, Rising air and stream-water temperatures in Chesapeake Bay region, USA:  Climatic Change: Volume 128, Issue 1-2 (2015), Page 127-138, doi:10.1007/s10584-014-1295-9.'}, {u'links': [{u'url': u'http://pubs.er.usgs.gov/thumbnails/outside_thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 659570704}], u'indexId': u'70135252', 'authorsList': [u'Scott L. Collins', u'Jayne Belnap', u'N.B. Grimm', u'J.A. Rudgers', u'C.N. Dahm', u"P. D. D'Odorico", u'M. Litvak', u'D.O. Natvig', u'Douglas C. Peters', u'W.T. Pockman', u'R.L. Sinsabaugh', u'B.O. Wolf'], u'startPage': u'397', u'id': 70135252, u'productDescription': u'23 p.', u'contributors': {u'authors': [{u'given': u'Scott L.', u'family': u'Collins', u'text': u'Collins, Scott L.', u'rank': 1, u'affiliation': {u'text': u'Department of Biology, University of New Mexico', u'id': 7000}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 71307, u'id': 526983, u'usgs': False}, {u'given': u'Jayne', u'family': u'Belnap', u'text': u'Belnap, Jayne jayne_belnap@usgs.gov', u'rank': 2, u'id': 526982, u'affiliation': {u'text': u'Southwest Biological Science Center', u'id': 568}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 1332, u'email': u'jayne_belnap@usgs.gov', u'usgs': True}, {u'given': u'N.B.', u'family': u'Grimm', u'text': u'Grimm, N.B.', u'rank': 3, u'affiliation': {u'text': u'Arizona State University', u'id': 6607}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 54164, u'id': 526984, u'usgs': False}, {u'given': u'J.A.', u'family': u'Rudgers', u'text': u'Rudgers, J.A.', u'rank': 4, u'affiliation': {u'text': u'Department of Biology, University of New Mexico, Albuquerque, NM 87131 USA', u'id': 7164}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 127832, u'id': 526991, u'usgs': False}, {u'given': u'C.N.', u'family': u'Dahm', u'text': u'Dahm, C.N.', u'rank': 5, u'affiliation': {u'text': u'Department of Biology, University of New Mexico', u'id': 7000}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 22730, u'id': 526985, u'usgs': False}, {u'given': u'P. D.', u'family': u"D'Odorico", u'text': u"D'Odorico, P. D.", u'rank': 6, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 56528, u'id': 526992, u'usgs': True}, {u'given': u'M.', u'family': u'Litvak', u'text': u'Litvak, M.', u'rank': 7, u'affiliation': {u'text': u'Department of Biology, University of New Mexico, Albuquerque, NM 87131 USA', u'id': 7164}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 127830, u'id': 526986, u'usgs': False}, {u'given': u'D.O.', u'family': u'Natvig', u'text': u'Natvig, D.O.', u'rank': 8, u'affiliation': {u'text': u'Department of Biology, University of New Mexico, Albuquerque, NM 87131 USA', u'id': 7164}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 127831, u'id': 526987, u'usgs': False}, {u'given': u'Douglas C.', u'family': u'Peters', u'text': u'Peters, Douglas C.', u'rank': 9, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 106797, u'id': 526993, u'usgs': True}, {u'given': u'W.T.', u'family': u'Pockman', u'text': u'Pockman, W.T.', u'rank': 10, u'affiliation': {u'text': u'Department of Biology, University of New Mexico, Albuquerque, NM 87131 USA', u'id': 7164}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 57260, u'id': 526988, u'usgs': False}, {u'given': u'R.L.', u'family': u'Sinsabaugh', u'text': u'Sinsabaugh, R.L.', u'rank': 11, u'affiliation': {u'text': u'Department of Biology, University of New Mexico, Albuquerque, NM 87131 USA', u'id': 7164}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 30784, u'id': 526989, u'usgs': False}, {u'given': u'B.O.', u'family': u'Wolf', u'text': u'Wolf, B.O.', u'rank': 12, u'affiliation': {u'text': u'Department of Biology, University of New Mexico, Albuquerque, NM 87131 USA', u'id': 7164}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 87897, u'id': 526990, u'usgs': False}]}, u'title': u'A multiscale, hierarchical model of pulse dynamics in arid-land ecosystems', u'onlineOnly': u'N', u'seriesTitle': {u'text': u'Annual Review of Ecology, Evolution and Systematics', u'id': 808}, u'endPage': u'419', u'publisher': u'Annual Reviews', u'lastModifiedDate': u'2014-12-15T11:01:09.000', u'costCenters': [{u'text': u'Southwest Biological Science Center', u'id': 568}], u'additionalOnlineFiles': u'N', u'volume': u'45', u'ipdsId': u'IP-056887', u'publicationType': {u'text': u'Article', u'id': 2}, u'publicationYear': u'2014', u'doi': u'10.1146/annurev-ecolsys-120213-091650', u'language': u'English', u'docAbstract': u'<p><span>Ecological processes in arid lands are often described by the pulse-reserve paradigm, in which rain events drive biological activity until moisture is depleted, leaving a reserve. This paradigm is frequently applied to processes stimulated by one or a few precipitation events within a growing season. Here we expand the original framework in time and space and include other pulses that interact with rainfall. This new hierarchical pulse-dynamics framework integrates space and time through pulse-driven exchanges, interactions, transitions, and transfers that occur across individual to multiple pulses extending from micro to watershed scales. Climate change will likely alter the size, frequency, and intensity of precipitation pulses in the future, and arid-land ecosystems are known to be highly sensitive to climate variability. Thus, a more comprehensive understanding of arid-land pulse dynamics is needed to determine how these ecosystems will respond to, and be shaped by, increased climate variability.</span></p>', u'displayToPublicDate': u'2014-12-15T12:00:00.000', u'publicationSubtype': {u'text': u'Journal Article', u'id': 10}, 'authorsListTyped': [{'text': u'Scott L. Collins', 'type': 'person'}, {'text': u'Jayne Belnap', 'type': 'person'}, {'text': u'N.B. Grimm', 'type': 'person'}, {'text': u'J.A. Rudgers', 'type': 'person'}, {'text': u'C.N. Dahm', 'type': 'person'}, {'text': u"P. D. D'Odorico", 'type': 'person'}, {'text': u'M. Litvak', 'type': 'person'}, {'text': u'D.O. Natvig', 'type': 'person'}, {'text': u'Douglas C. Peters', 'type': 'person'}, {'text': u'W.T. Pockman', 'type': 'person'}, {'text': u'R.L. Sinsabaugh', 'type': 'person'}, {'text': u'B.O. Wolf', 'type': 'person'}], u'usgsCitation': u'Collins, S.L., Belnap, J., Grimm, N.B., Rudgers, J.A., Dahm, C.N., D\u2019Odorico, P., Litvak, M., Natvig, D.O., Peters, D.C., Pockman, W.T., Sinsabaugh, R.L., and Wolf, B.O., 2014, A multiscale, hierarchical model of pulse dynamics in arid-land ecosystems:  Annual Review of Ecology, Evolution, and Systematics, vol. 45, p. 397-419, http://dx.doi.org/10.1146/annurev-ecolsys-120213-091650.'}, {u'links': [{u'url': u'http://pubs.er.usgs.gov/thumbnails/outside_thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 659360410}], u'indexId': u'70135422', 'authorsList': [u'Stephen R. Hinkle', u'Anthony J. Tesoriero'], u'startPage': u'343', u'id': 70135422, u'productDescription': u'11 p.', u'contributors': {u'authors': [{u'given': u'Stephen R.', u'family': u'Hinkle', u'text': u'Hinkle, Stephen R. srhinkle@usgs.gov', u'rank': 1, u'id': 527120, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 1171, u'email': u'srhinkle@usgs.gov', u'usgs': True}, {u'given': u'Anthony J.', u'family': u'Tesoriero', u'text': u'Tesoriero, Anthony J.', u'rank': 2, u'affiliation': {u'text': u'Oregon Water Science Center', u'id': 518}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 40207, u'id': 536673, u'usgs': True}]}, u'title': u'Nitrogen speciation and trends, and prediction of denitrification extent, in shallow US groundwater', u'onlineOnly': u'N', u'seriesTitle': {u'text': u'Journal of Hydrology', u'id': 2342}, u'endPage': u'353', u'publisher': u'Elsevier', u'lastModifiedDate': u'2014-12-15T10:46:55.000', u'costCenters': [{u'text': u'Oregon Water Science Center', u'id': 518}], u'additionalOnlineFiles': u'N', u'volume': u'509', u'ipdsId': u'IP-028945', u'publicationType': {u'text': u'Article', u'id': 2}, u'publicationYear': u'2014', u'doi': u'10.1016/j.jhydrol.2013.11.048', u'language': u'English', u'country': u'United States', u'docAbstract': u'<p><span>Uncertainties surrounding nitrogen cycling complicate assessments of the environmental effects of nitrogen use and our understanding of the global carbon&ndash;nitrogen cycle. In this paper, we synthesize data from 877 ambient-monitoring wells across the US to frame broad patterns of nitrogen speciation and trends. At these sites, groundwater frequently contains substantial co-occurring NO</span><sub>3</sub><sup>&minus;</sup><span>&nbsp;and XSN</span><sub>2</sub><span>&nbsp;(N</span><sub>2</sub><span>&nbsp;from denitrification), reflecting active/ongoing denitrification and/or a mixture of undenitrified and denitrified groundwater. NO</span><sub>3</sub><sup>&minus;</sup><span>&nbsp;and NH</span><sub>4</sub><sup>+</sup><span>&nbsp;essentially do not co-occur, indicating that the dominant source of NH</span><sub>4</sub><sup>+</sup><span>&nbsp;at these sites likely is not dissimilatory reduction of NO</span><sub>3</sub><sup>&minus;</sup><span>&nbsp;to NH</span><sub>4</sub><sup>+</sup><span>. Positive correlations of NH</span><sub>4</sub><sup>+</sup><span>&nbsp;with apparent age, CH</span><sub>4</sub><span>, dissolved organic carbon, and indicators of reduced conditions are consistent with NH</span><sub>4</sub><sup>+</sup><span>&nbsp;mobilization from degradation of aquifer organic matter and contraindicate an anthropogenic source of NH</span><sub>4</sub><sup>+</sup><span>&nbsp;for most sites. Glacial aquifers and eastern sand and gravel aquifers generally have lower proportions of NO</span><sub>3</sub><sup>&minus;</sup><span>&nbsp;and greater proportions of XSN</span><sub>2</sub><span>&nbsp;than do fractured rock and karst aquifers and western sand and gravel aquifers. NO</span><sub>3</sub><sup>&minus;</sup><span>&nbsp;dominates in the youngest groundwater, but XSN</span><sub>2</sub><span>&nbsp;increases as residence time increases. Temporal patterns of nitrogen speciation and concentration reflect (1) changing NO</span><sub>3</sub><sup>&minus;</sup><span>&nbsp;loads over time, (2) groundwater residence-time controls on NH</span><sub>4</sub><sup>+</sup><span>&nbsp;mobilization from solid phases, and (3) groundwater residence-time controls on denitrification. A simple classification tree using readily available variables (a national coverage of soil water depth, generalized geology) or variables reasonably estimated in many aquifers (residence time) identifies categorical denitrification extent (&lt;10%, 10&ndash;50%, and&nbsp;&gt;50%) with 79% accuracy in an independent testing set, demonstrating a predictive application based on the interconnected effects of redox, geology, and residence time.</span></p>', u'displayToPublicDate': u'2014-12-15T11:45:00.000', u'publicationSubtype': {u'text': u'Journal Article', u'id': 10}, 'authorsListTyped': [{'text': u'Stephen R. Hinkle', 'type': 'person'}, {'text': u'Anthony J. Tesoriero', 'type': 'person'}], u'usgsCitation': u'Hinkle, S.R., and Tesoriero, A.J., 2014, Nitrogen speciation and trends, and prediction of denitrification extent, in shallow US groundwater: Journal of Hydrology, v. 509, p. 343-353.'}, {u'links': [{u'url': u'http://pubs.er.usgs.gov/thumbnails/outside_thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 659063549}], u'indexId': u'70135620', u'geographicExtents': u'{\n  "type": "FeatureCollection",\n  "features": [\n    {\n      "type": "Feature",\n      "properties": {},\n      "geometry": {\n        "type": "Polygon",\n        "coordinates": [\n          [\n            [\n              -114.10400390625,\n              42.01665183556825\n            ],\n            [\n              -110.98388671874999,\n              42.01665183556825\n            ],\n            [\n              -111.02783203125,\n              41.0130657870063\n            ],\n            [\n              -108.91845703124999,\n              41.04621681452063\n            ],\n            [\n              -109.0283203125,\n              36.98500309285596\n            ],\n            [\n              -113.99414062499999,\n              37.00255267215955\n            ],\n            [\n              -114.10400390625,\n              42.01665183556825\n            ]\n          ]\n        ]\n      }\n    }\n  ]\n}', u'edition': u'Online First', 'authorsList': [u'Victor M. Heilweil', u'Jerome Benoit', u'Richard W. Healy'], u'id': 70135620, u'contributors': {u'authors': [{u'given': u'Victor M.', u'family': u'Heilweil', u'text': u'Heilweil, Victor M. heilweil@usgs.gov', u'rank': 1, u'id': 527151, u'affiliation': {u'text': u'Utah Water Science Center', u'id': 610}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 837, u'email': u'heilweil@usgs.gov', u'usgs': True}, {u'given': u'Jerome', u'family': u'Benoit', u'text': u'Benoit, Jerome', u'rank': 2, u'affiliation': {u'text': u'\xc9cole Nationale du Genie de l\u2019Eau et de l\u2019Environnement de Strasbourg', u'id': 7174}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 128458, u'id': 527153, u'usgs': False}, {u'given': u'Richard W.', u'family': u'Healy', u'text': u'Healy, Richard W. rwhealy@usgs.gov', u'rank': 3, u'id': 527152, u'affiliation': {u'text': u'National Research Program - Central Branch', u'id': 5044}, u'contributorType': {u'text': u'Authors', u'id': 1}, u'corporation': False, u'contributorId': 658, u'email': u'rwhealy@usgs.gov', u'usgs': True}]}, u'title': u'Variably-saturated groundwater modeling for optimizing managed aquifer recharge using trench infiltration', u'state': u'Utah', u'onlineOnly': u'N', u'seriesTitle': {u'text': u'Hydrological Processes', u'id': 1924}, u'publisher': u'Wiley', u'lastModifiedDate': u'2014-12-15T10:38:21.000', u'costCenters': [{u'text': u'Utah Water Science Center', u'id': 610}], u'additionalOnlineFiles': u'N', u'ipdsId': u'IP-053219', u'publicationType': {u'text': u'Article', u'id': 2}, u'publicationYear': u'2014', u'doi': u'10.1002/hyp.10413', u'language': u'English', u'country': u'United States', u'docAbstract': u'<p><span>Spreading-basin methods have resulted in more than 130 million cubic meters of recharge to the unconfined Navajo Sandstone of southern Utah in the past decade, but infiltration rates have slowed in recent years because of reduced hydraulic gradients and clogging. Trench infiltration is a promising alternative technique for increasing recharge and minimizing evaporation. This paper uses a variably saturated flow model to further investigate the relative importance of the following variables on rates of trench infiltration to unconfined aquifers: saturated hydraulic conductivity, trench spacing and dimensions, initial water-table depth, alternate wet/dry periods, and number of parallel trenches. Modeling results showed (1) increased infiltration with higher hydraulic conductivity, deeper initial water tables, and larger spacing between parallel trenches, (2) deeper or wider trenches do not substantially increase infiltration, (3) alternating wet/dry periods result in less overall infiltration than keeping the trenches continuously full, and (4) larger numbers of parallel trenches within a fixed area increases infiltration but with a diminishing effect as trench spacing becomes tighter. An empirical equation for estimating expected trench infiltration rates as a function of hydraulic conductivity and initial water-table depth was derived and can be used for evaluating feasibility of trench infiltration in other hydrogeologic settings</span></p>', u'displayToPublicDate': u'2014-12-15T11:30:00.000', u'publicationSubtype': {u'text': u'Journal Article', u'id': 10}, 'authorsListTyped': [{'text': u'Victor M. Heilweil', 'type': 'person'}, {'text': u'Jerome Benoit', 'type': 'person'}, {'text': u'Richard W. Healy', 'type': 'person'}]}], u'pageNumber': None, u'pageRowStart': u'0', u'pageSize': u'15', u'recordCount': 4}
    world.expected_status_code = 200


@step(r'I am given the appropriate responses')
def check_responses(step):
    httpretty.disable()
    httpretty.reset()

    response_content, status_code = world.response
    assert_equal(status_code, world.expected_status_code)
    assert_equal(response_content, world.expected_return_content)


@step(r'we have created a fake url and mocked a down service')
def imitation_fail(step):
    httpretty.enable()
    httpretty.register_uri(httpretty.GET,
                           world.search_url,
                           content_type='application/json',
                           status=503
                           )

@step(r'I search through the failed service')
def search_nothing(step):
    test_params = {'q': 'some_state'}
    world.response = SearchPublications(world.search_url).get_pubs_search_results(test_params)
    world.expected_return_content = None
    world.expected_status_code = 503


"""
sort list of dictionaries scenario
"""
@step(r'I have a list of dictionaries')
def setup_list(step):
    world.test_list = [{'year': '2013', 'title': 'Napoleonic Wars 1810 - 1815'},
                       {'year': '2010', 'title': 'Napoleanic Wars 1803 - 1810'}
                       ]
    
@step(r'I provide the list and a valid key name')
def perform_sorting(step):
    world.result = sort_list_of_dicts(world.test_list, key_name='year')
    
@step(r'I see a list sorted by the specified key')
def check_sort_results(step):
    world.expected_first_item = {'year': '2010', 'title': 'Napoleanic Wars 1803 - 1810'}
    actual_first_item = world.result[0]
    assert_equal(world.expected_first_item, actual_first_item)
    
"""
Parse superseding information scenario
"""
@step(r'I have mocked some publication JSON')
def mock_supersedes(step):
    world.mock_supersedes = {u'seriesNumber': u'071-99', u'links': [{u'url': u'http://pubs.usgs.gov/fs/1999/0071/report.pdf', u'rank': 300, u'type': {u'text': u'Document', u'id': 11}, u'id': 5107809, u'linkFileType': {u'text': u'pdf', u'id': 1}}, {u'url': u'http://pubs.usgs.gov/fs/1999/0071/report-thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 5231293, u'rank': 0}], u'edition': u'-', u'authorsList': [u'U.S. Geological Survey'], u'displayLinks': {u'Project Site': [], u'Application Site': [], u'Raw Data': [], u'Document': [{u'url': u'http://pubs.usgs.gov/fs/1999/0071/report.pdf', u'rank': 300, u'type': {u'text': u'Document', u'id': 11}, u'id': 5107809, u'linkFileType': {u'text': u'pdf', u'id': 1}}], u'Thumbnail': [{u'url': u'http://pubs.usgs.gov/fs/1999/0071/report-thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 5231293, u'rank': 0}], u'Metadata': [], u'Plate': [], u'Spatial Data': [], u'Companion Files': [], u'Illustration': [], u'Appendix': [], u'Index Page': [], u'Chapter': [], u'Read Me': [], u'Version History': [], u'Database': [], u'Cover': [], u'Authors Website': [], u'Errata': [], u'Additional Report Piece': [], u'Related Work': [], u'Abstract': [], u'Referenced Work': [], u'Digital Object Identifier': [], u'Image': []}, u'pubHasNoLinks': False, u'id': 5329, u'relationships': {u'@context': {u'rdac': u'http://rdaregistry.info/Elements/c/', u'rdaw:replacedByWork': {u'@type': u'@id'}, u'rdaw': u'http://rdaregistry.info/Elements/w/', u'dc': u'http://purl.org/dc/elements/1.1/', u'rdaw:replacementOfWork': {u'@type': u'@id'}, u'xsd': u'http://www.w3.org/2001/XMLSchema#'}, u'@graph': [{u'dc:date': u'1999', u'dc:title': u'U.S. Geological Survey World Wide Web Information', u'@id': u'http://pubs-fake.er.usgs.gov/publication/rj17u', u'@type': u'rdac:Work'}, {u'dc:date': u'1997', u'dc:title': u'U.S. Geological Survey World Wide Web information', u'@id': u'http://pubs-fake.er.usgs.gov/publication/fs12196', u'@type': u'rdac:Work', u'rdaw:replacedByWork': u'http://pubs-fake.er.usgs.gov/publication/rj17u'}, {u'dc:date': u'1997', u'dc:title': u'U.S. Geological Survey World Wide Web information', u'@id': u'http://pubs-fake.er.usgs.gov/publication/fs12196', u'@type': u'rdac:Work', u'rdaw:replacedByWork': u'http://pubs-fake.er.usgs.gov/publication/rj17u'}, {u'dc:date': u'2000', u'rdaw:replacementOfWork': u'http://pubs-fake.er.usgs.gov/publication/rj17u', u'dc:title': u'U.S. Geological Survey World Wide Web Information', u'@id': u'http://pubs-fake.er.usgs.gov/publication/fs03700', u'@type': u'rdac:Work'}, {u'dc:date': u'2001', u'rdaw:replacementOfWork': u'http://pubs-fake.er.usgs.gov/publication/rj17u', u'dc:title': u'U.S. Geological Survey World Wide Web Information', u'@id': u'http://pubs-fake.er.usgs.gov/publication/fs03301', u'@type': u'rdac:Work'}, {u'dc:date': u'2003', u'rdaw:replacementOfWork': u'http://pubs-fake.er.usgs.gov/publication/rj17u', u'dc:title': u'U.S. Geological Survey World Wide Web Information', u'@id': u'http://pubs-fake.er.usgs.gov/publication/fs05503', u'@type': u'rdac:Work'}]}, u'productDescription': u'2 p.', u'publisherLocation': u'Reston, VA', u'contributors': {u'authors': [{u'corporation': True, u'rank': 1, u'contributorType': {u'text': u'Authors', u'id': 1}, u'organization': u'U.S. Geological Survey', u'contributorId': 128075, u'text': u'U.S. Geological Survey', u'id': 528496, u'usgs': False}]}, u'docAbstract': u'The U.S. Geological Survey (USGS) invites you to explore an earth science virtual library of digital information, publications, and data. The USGS Internet World Wide Web sites offer an array of information that reflects scientific research and monitoring programs conducted in the areas of natural hazards, environmental resources, and cartography. This list provides gateways to access a cross section of the digital information on the USGS World Wide Web sites.', u'details': [{u'Publication type:': u'Report'}, {u'Publication Subtype:': u'USGS Numbered Series'}, {u'Title:': u'U.S. Geological Survey World Wide Web Information'}, {u'Series title:': u'Fact Sheet'}, {u'Series number:': u'071-99'}, {u'Edition:': u'-'}, {u'Year Published:': u'1999'}, {u'Language:': u'ENGLISH'}, {u'Publisher:': u'U.S.Geological Survey'}, {u'Publisher location:': u'Reston, VA'}, {u'Contributing office(s):': u'U.S. Geological Survey'}, {u'Description:': u'2 p.'}], u'lastModifiedDate': u'2012-03-16T17:16:05.000', u'seriesTitle': {u'onlineIssn': u'2327-6932', u'text': u'Fact Sheet', u'id': 313, u'printIssn': u'2327-6916'}, u'publicationType': {u'text': u'Report', u'id': 18}, u'costCenters': [{u'text': u'U.S. Geological Survey', u'id': 595}], u'indexId': u'rj17u', u'formattedModifiedDateTime': u'March 16, 2012 17:16:05', u'publisher': u'U.S.Geological Survey', u'publicationYear': u'1999', u'language': u'ENGLISH', u'title': u'U.S. Geological Survey World Wide Web Information', u'displayToPublicDate': u'1994-01-01T00:00:00.000', u'publicationSubtype': {u'text': u'USGS Numbered Series', u'id': 5}, u'authorsListTyped': [{u'text': u'U.S. Geological Survey', u'type': u'corporation'}], u'usgsCitation': u'U.S. Geological Survey World Wide Web Information; 1999; FS; 071-99; Geological Survey (U.S.)'}
    
@step(r'I pass the JSON to extract_related_pub_info')
def execute_supersedes_parsing(step):
    world.parse_result = extract_related_pub_info(world.mock_supersedes)
    
@step(r'I see a dictionary containing the preceding and superseding publications')
def check_supersedes_parsing(step):
    expected = {'precede_info': [{'year': u'1997', 'id': u'fs12196', 'title': u'U.S. Geological Survey World Wide Web information'}, {'year': u'1997', 'id': u'fs12196', 'title': u'U.S. Geological Survey World Wide Web information'}], 'supersede_info': [{'year': u'2000', 'id': u'fs03700', 'title': u'U.S. Geological Survey World Wide Web Information'}, {'year': u'2001', 'id': u'fs03301', 'title': u'U.S. Geological Survey World Wide Web Information'}, {'year': u'2003', 'id': u'fs05503', 'title': u'U.S. Geological Survey World Wide Web Information'}], 'precede_len': 2, 'supersede_len': 3}
    assert_equal(expected, world.parse_result)


"""
Munging abstract scenario
"""


@step("There is an publication record with a docAbstract that contains an H1 tag")
def abstact_with_h1(step):
    """
    :type step lettuce.core.Step
    """
    world.mock_pubs_with_h1 = \
        {u'additionalOnlineFiles': u'N',
 u'contact': u'<p>Director, National Climate Change and Wildlife Science Center<br /> U.S. Geological Survey<br /> MS 516 National Center<br /> 12201 Sunrise Valley Drive <br />Reston, VA 20192<br /> <a href="https://nccwsc.usgs.gov/">https://nccwsc.usgs.gov/ </a></p>',
 u'contributors': {u'authors': [{u'affiliation': {u'id': 411,
                                                  u'text': u'National Climate Change and Wildlife Science Center'},
                                 u'contributorId': 131090,
                                 u'contributorType': {u'id': 1,
                                                      u'text': u'Authors'},
                                 u'corporation': False,
                                 u'email': u'evarela-acevedo@usgs.gov',
                                 u'family': u'Varela Minder',
                                 u'given': u'Elda',
                                 u'id': 568180,
                                 u'rank': 1,
                                 u'text': u'Varela Minder, Elda evarela-acevedo@usgs.gov',
                                 u'usgs': True},
                                {u'contributorId': 97822,
                                 u'contributorType': {u'id': 1,
                                                      u'text': u'Authors'},
                                 u'corporation': False,
                                 u'family': u'Padgett',
                                 u'given': u'Holly A.',
                                 u'id': 578231,
                                 u'rank': 2,
                                 u'text': u'Padgett, Holly A.',
                                 u'usgs': True}]},
 u'costCenters': [{u'id': 411,
                   u'text': u'National Climate Change and Wildlife Science Center'}],
 u'country': u'United States',
 u'displayToPublicDate': u'2015-10-27T12:00:00.000',
 u'docAbstract': u'<h1>Introduction</h1>\n<p>The National Climate Change and Wildlife Science Center (NCCWSC) and the Department of the Interior (DOI) Climate Science Centers (CSCs) had another exciting year in 2014. The NCCWSC moved toward focusing their science funding on several high priority areas and, along with the CSCs, gained new agency partners; contributed to various workshops, meetings, publications, student activities, and Tribal/indigenous activities; increased outreach; and more.&nbsp;</p>',
 u'doi': u'10.3133/cir1415',
 u'geographicExtents': u'',
 u'id': 70156241,
 u'indexId': u'cir1415',
 u'interactions': [],
 u'ipdsId': u'IP-064590',
 u'language': u'English',
 u'lastModifiedDate': u'2015-10-27T14:20:49.000',
 u'links': [{u'description': u'CIR 1415',
             u'id': 310576,
             u'linkFileType': {u'id': 1, u'text': u'pdf'},
             u'rank': 2,
             u'size': u'4 MB',
             u'text': u'Report',
             u'type': {u'id': 11, u'text': u'Document'},
             u'url': u'http://pubs.usgs.gov/circ/1415/circ1415.pdf'},
            {u'id': 310575,
             u'rank': 1,
             u'type': {u'id': 24, u'text': u'Thumbnail'},
             u'url': u'http://pubs.usgs.gov/circ/1415/coverthb.jpg'}],
 u'onlineOnly': u'Y',
 u'productDescription': u'v, 18 p.',
 u'publicationSubtype': {u'id': 5, u'text': u'USGS Numbered Series'},
 u'publicationType': {u'id': 18, u'text': u'Report'},
 u'publicationYear': u'2015',
 u'publishedDate': u'2015-10-27',
 u'publisher': u'U.S. Geological Survey',
 u'publisherLocation': u'Reston, VA',
 u'publishingServiceCenter': {u'id': 9, u'text': u'Reston PSC'},
 u'seriesNumber': u'1415',
 u'seriesTitle': {u'id': 307,
                  u'onlineIssn': u'2330-5703',
                  u'printIssn': u'1067-084X',
                  u'text': u'Circular'},
 u'tableOfContents': u'<ul>\n<li>Introduction</li>\n<li>Providing Science and Tools to Address the Impacts of Climate Change</li>\n<li>Partnering to Ensure High Quality and Usable Science for All Stakeholders</li>\n<li>New Federal Partners</li>\n<li>Building Relations and Communicating Our Science</li>\n<li>Training the Next Generation of Scientists and Managers</li>\n<li>Strengthening the NCCWSC/CSC Enterprise</li>\n<li>More about the NCCWSC and DOI CSCs</li>\n<li>DOI Climate Science Centers</li>\n</ul>',
 u'text': u'cir1415 - 2015 - The National Climate Change and Wildlife Science Center and Department of the Interior Climate Science Centers annual report for 2014',
 u'title': u'The National Climate Change and Wildlife Science Center and Department of the Interior Climate Science Centers annual report for 2014',
 u'usgsCitation': u'Varela Minder, Elda, and Padgett, Holly A. 2015, The National Climate Change and Wildlife Science Center and Department of the Interior Climate Science Centers annual report for 2014: U.S. Geological Survey Circular 1415, 32 p., http://dx.doi.org/10.3133/cir1415.'}



@step("I pass the publication record to munge_abstract")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """
    world.munged_abstract_result = munge_abstract(world.mock_pubs_with_h1)
    world.munged_abstract_result_expected = \
        {'abstractHeader': u'Introduction',
 u'additionalOnlineFiles': u'N',
 u'contact': u'<p>Director, National Climate Change and Wildlife Science Center<br /> U.S. Geological Survey<br /> MS 516 National Center<br /> 12201 Sunrise Valley Drive <br />Reston, VA 20192<br /> <a href="https://nccwsc.usgs.gov/">https://nccwsc.usgs.gov/ </a></p>',
 u'contributors': {u'authors': [{u'affiliation': {u'id': 411,
                                                  u'text': u'National Climate Change and Wildlife Science Center'},
                                 u'contributorId': 131090,
                                 u'contributorType': {u'id': 1,
                                                      u'text': u'Authors'},
                                 u'corporation': False,
                                 u'email': u'evarela-acevedo@usgs.gov',
                                 u'family': u'Varela Minder',
                                 u'given': u'Elda',
                                 u'id': 568180,
                                 u'rank': 1,
                                 u'text': u'Varela Minder, Elda evarela-acevedo@usgs.gov',
                                 u'usgs': True},
                                {u'contributorId': 97822,
                                 u'contributorType': {u'id': 1,
                                                      u'text': u'Authors'},
                                 u'corporation': False,
                                 u'family': u'Padgett',
                                 u'given': u'Holly A.',
                                 u'id': 578231,
                                 u'rank': 2,
                                 u'text': u'Padgett, Holly A.',
                                 u'usgs': True}]},
 u'costCenters': [{u'id': 411,
                   u'text': u'National Climate Change and Wildlife Science Center'}],
 u'country': u'United States',
 u'displayToPublicDate': u'2015-10-27T12:00:00.000',
 u'docAbstract': '\n<p>The National Climate Change and Wildlife Science Center (NCCWSC) and the Department of the Interior (DOI) Climate Science Centers (CSCs) had another exciting year in 2014. The NCCWSC moved toward focusing their science funding on several high priority areas and, along with the CSCs, gained new agency partners; contributed to various workshops, meetings, publications, student activities, and Tribal/indigenous activities; increased outreach; and more.\xc2\xa0</p>',
 u'doi': u'10.3133/cir1415',
 u'geographicExtents': u'',
 u'id': 70156241,
 u'indexId': u'cir1415',
 u'interactions': [],
 u'ipdsId': u'IP-064590',
 u'language': u'English',
 u'lastModifiedDate': u'2015-10-27T14:20:49.000',
 u'links': [{u'description': u'CIR 1415',
             u'id': 310576,
             u'linkFileType': {u'id': 1, u'text': u'pdf'},
             u'rank': 2,
             u'size': u'4 MB',
             u'text': u'Report',
             u'type': {u'id': 11, u'text': u'Document'},
             u'url': u'http://pubs.usgs.gov/circ/1415/circ1415.pdf'},
            {u'id': 310575,
             u'rank': 1,
             u'type': {u'id': 24, u'text': u'Thumbnail'},
             u'url': u'http://pubs.usgs.gov/circ/1415/coverthb.jpg'}],
 u'onlineOnly': u'Y',
 u'productDescription': u'v, 18 p.',
 u'publicationSubtype': {u'id': 5, u'text': u'USGS Numbered Series'},
 u'publicationType': {u'id': 18, u'text': u'Report'},
 u'publicationYear': u'2015',
 u'publishedDate': u'2015-10-27',
 u'publisher': u'U.S. Geological Survey',
 u'publisherLocation': u'Reston, VA',
 u'publishingServiceCenter': {u'id': 9, u'text': u'Reston PSC'},
 u'seriesNumber': u'1415',
 u'seriesTitle': {u'id': 307,
                  u'onlineIssn': u'2330-5703',
                  u'printIssn': u'1067-084X',
                  u'text': u'Circular'},
 u'tableOfContents': u'<ul>\n<li>Introduction</li>\n<li>Providing Science and Tools to Address the Impacts of Climate Change</li>\n<li>Partnering to Ensure High Quality and Usable Science for All Stakeholders</li>\n<li>New Federal Partners</li>\n<li>Building Relations and Communicating Our Science</li>\n<li>Training the Next Generation of Scientists and Managers</li>\n<li>Strengthening the NCCWSC/CSC Enterprise</li>\n<li>More about the NCCWSC and DOI CSCs</li>\n<li>DOI Climate Science Centers</li>\n</ul>',
 u'text': u'cir1415 - 2015 - The National Climate Change and Wildlife Science Center and Department of the Interior Climate Science Centers annual report for 2014',
 u'title': u'The National Climate Change and Wildlife Science Center and Department of the Interior Climate Science Centers annual report for 2014',
 u'usgsCitation': u'Varela Minder, Elda, and Padgett, Holly A. 2015, The National Climate Change and Wildlife Science Center and Department of the Interior Climate Science Centers annual report for 2014: U.S. Geological Survey Circular 1415, 32 p., http://dx.doi.org/10.3133/cir1415.'}





@step("I see a dictionary containing the abstractHeader data element and no h1 tags in the docAbstract data element")
def step_impl(step):
    """
    :type step lettuce.core.Step

    """
    print world.munged_abstract_result
    assert_items_equal(world.munged_abstract_result, world.munged_abstract_result_expected)


@step("I have a mocked base publication record that has a populated interactions data element, a base url, and a mocked legacy endpoint")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """
    world.pub_with_precede_and_supersede = \
        {u'additionalOnlineFiles': u'N',
         u'contributors': {u'authors': [{u'contributorId': 128075,
                                         u'contributorType': {u'id': 1,
                                                              u'text': u'Authors'},
                                         u'corporation': True,
                                         u'id': 528496,
                                         u'organization': u'U.S. Geological Survey',
                                         u'rank': 1,
                                         u'text': u'U.S. Geological Survey',
                                         u'usgs': False}]},
         u'costCenters': [],
         u'displayToPublicDate': u'1994-01-01T00:00:00.000',
         u'docAbstract': u'<p>The U.S. Geological Survey (USGS) invites you to explore an earth science virtual library of digital information, publications, and data. The USGS Internet World Wide Web sites offer an array of information that reflects scientific research and monitoring programs conducted in the areas of natural hazards, environmental resources, and cartography. This list provides gateways to access a cross section of the digital information on the USGS World Wide Web sites.</p>',
         u'edition': u'-',
         u'id': 5329,
         u'indexId': u'fs07199',
         u'interactions': [{u'id': 1,
                            u'object': {u'id': 5329,
                                        u'indexId': u'fs07199',
                                        u'publicationYear': u'1999',
                                        u'text': u'fs07199 - 1999 - U.S. Geological Survey World Wide Web Information',
                                        u'title': u'U.S. Geological Survey World Wide Web Information'},
                            u'predicate': u'SUPERSEDED_BY',
                            u'subject': {u'id': 5328,
                                         u'indexId': u'fs12196',
                                         u'publicationYear': u'1997',
                                         u'text': u'fs12196 - 1997 - U.S. Geological Survey World Wide Web information',
                                         u'title': u'U.S. Geological Survey World Wide Web information'}},
                           {u'id': 2,
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
                                         u'title': u'U.S. Geological Survey World Wide Web Information'}}],
         u'language': u'ENGLISH',
         u'lastModifiedDate': u'2015-05-19T09:06:22.000',
         u'links': [{u'id': 139664,
                     u'rank': 0,
                     u'type': {u'id': 24, u'text': u'Thumbnail'},
                     u'url': u'http://pubs.usgs.gov/fs/1999/0071/report-thumb.jpg'},
                    {u'id': 32025,
                     u'linkFileType': {u'id': 1, u'text': u'pdf'},
                     u'rank': 300,
                     u'type': {u'id': 11, u'text': u'Document'},
                     u'url': u'http://pubs.usgs.gov/fs/1999/0071/report.pdf'}],
         u'onlineOnly': u'N',
         u'productDescription': u'2 p.',
         u'publicationSubtype': {u'id': 5, u'text': u'USGS Numbered Series'},
         u'publicationType': {u'id': 18, u'text': u'Report'},
         u'publicationYear': u'1999',
         u'publisher': u'U.S.Geological Survey',
         u'publisherLocation': u'Reston, VA',
         u'seriesNumber': u'071-99',
         u'seriesTitle': {u'id': 313,
                          u'onlineIssn': u'2327-6932',
                          u'printIssn': u'2327-6916',
                          u'text': u'Fact Sheet'},
         u'supersededBy': {u'id': 53167,
                           u'indexId': u'fs05503',
                           u'publicationYear': u'2003',
                           u'text': u'fs05503 - 2003 - U.S. Geological Survey World Wide Web Information',
                           u'title': u'U.S. Geological Survey World Wide Web Information'},
         u'text': u'fs07199 - 1999 - U.S. Geological Survey World Wide Web Information',
         u'title': u'U.S. Geological Survey World Wide Web Information',
         u'usgsCitation': u'U.S. Geological Survey World Wide Web Information; 1999; FS; 071-99; Geological Survey (U.S.)'}
    world.legacy_supersedes_url_base = 'http://pubs-fake.er.usgs.gov/service/citation/json/extras'
    world.legacy_supersedes_url = 'http://pubs-fake.er.usgs.gov/service/citation/json/extras?prod_id=fs07199'
    resp_data = '{ "modsCollection": { "@rowCount": "1", "mods": [{ "identifier": { "@type": "pw", "#text": "fs07199"}, "location": { "url": [{ "@note": "THUMBNAIL", "#text": "http://pubs.usgs.gov/fs/1999/0071/report-thumb.jpg"}, { "@displayLabel": "pdf", "@note": "DOCUMENT", "#text": "http://pubs.usgs.gov/fs/1999/0071/report.pdf"}] }, "relatedItem": [{ "base_id": { "@type": "pw", "#text": "fs07199"}, "@type": "succeeding", "identifier": { "@type": "pw", "#text": "fs03700"}, "titleInfo": { "title": "U.S. Geological Survey World Wide Web Information"}, "originInfo": { "dateIssued": "2000"}}, { "base_id": { "@type": "pw", "#text": "fs07199"}, "@type": "succeeding", "identifier": { "@type": "pw", "#text": "fs03301"}, "titleInfo": { "title": "U.S. Geological Survey World Wide Web Information"}, "originInfo": { "dateIssued": "2001"}}, { "base_id": { "@type": "pw", "#text": "fs07199"}, "@type": "succeeding", "identifier": { "@type": "pw", "#text": "fs05503"}, "titleInfo": { "title": "U.S. Geological Survey World Wide Web Information"}, "originInfo": { "dateIssued": "2003"}}, { "base_id": { "@type": "pw", "#text": "fs07199"}, "@type": "preceding", "identifier": { "@type": "pw", "#text": "fs12196"}, "titleInfo": { "title": "U.S. Geological Survey World Wide Web information"}, "originInfo": { "dateIssued": "1997"}}] }] }}'
    httpretty.enable()
    httpretty.register_uri(httpretty.GET,
                           world.legacy_supersedes_url,
                           body=resp_data,
                           content_type='application/json',
                           status=200)




@step("I pass those interactions variables to add_relationships_graphs")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """
    world.superseded_publication_record_with_graph = add_relationships_graphs(world.pub_with_precede_and_supersede,
                                                                              world.legacy_supersedes_url_base,
                                                                              'http://127.0.0.1:5050/')


@step("the relationships data element of the pubs record should contain what I expect")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """
    expected_record = \
        {u'additionalOnlineFiles': u'N',
         u'contributors': {u'authors': [{u'contributorId': 128075,
                                         u'contributorType': {u'id': 1,
                                                              u'text': u'Authors'},
                                         u'corporation': True,
                                         u'id': 528496,
                                         u'organization': u'U.S. Geological Survey',
                                         u'rank': 1,
                                         u'text': u'U.S. Geological Survey',
                                         u'usgs': False}]},
         u'costCenters': [],
         u'displayToPublicDate': u'1994-01-01T00:00:00.000',
         u'docAbstract': u'<p>The U.S. Geological Survey (USGS) invites you to explore an earth science virtual library of digital information, publications, and data. The USGS Internet World Wide Web sites offer an array of information that reflects scientific research and monitoring programs conducted in the areas of natural hazards, environmental resources, and cartography. This list provides gateways to access a cross section of the digital information on the USGS World Wide Web sites.</p>',
         u'edition': u'-',
         u'id': 5329,
         u'indexId': u'fs07199',
         u'interactions': [{u'id': 1,
                            u'object': {u'id': 5329,
                                        u'indexId': u'fs07199',
                                        u'publicationYear': u'1999',
                                        u'text': u'fs07199 - 1999 - U.S. Geological Survey World Wide Web Information',
                                        u'title': u'U.S. Geological Survey World Wide Web Information'},
                            u'predicate': u'SUPERSEDED_BY',
                            u'subject': {u'id': 5328,
                                         u'indexId': u'fs12196',
                                         u'publicationYear': u'1997',
                                         u'text': u'fs12196 - 1997 - U.S. Geological Survey World Wide Web information',
                                         u'title': u'U.S. Geological Survey World Wide Web information'}},
                           {u'id': 2,
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
                                         u'title': u'U.S. Geological Survey World Wide Web Information'}}],
         u'language': u'ENGLISH',
         u'lastModifiedDate': u'2015-05-19T09:06:22.000',
         u'links': [{u'id': 139664,
                     u'rank': 0,
                     u'type': {u'id': 24, u'text': u'Thumbnail'},
                     u'url': u'http://pubs.usgs.gov/fs/1999/0071/report-thumb.jpg'},
                    {u'id': 32025,
                     u'linkFileType': {u'id': 1, u'text': u'pdf'},
                     u'rank': 300,
                     u'type': {u'id': 11, u'text': u'Document'},
                     u'url': u'http://pubs.usgs.gov/fs/1999/0071/report.pdf'}],
         u'onlineOnly': u'N',
         u'productDescription': u'2 p.',
         u'publicationSubtype': {u'id': 5, u'text': u'USGS Numbered Series'},
         u'publicationType': {u'id': 18, u'text': u'Report'},
         u'publicationYear': u'1999',
         u'publisher': u'U.S.Geological Survey',
         u'publisherLocation': u'Reston, VA',
         'relationships': {'@context': {'dc': 'http://purl.org/dc/elements/1.1/',
                                        'rdac': 'http://rdaregistry.info/Elements/c/',
                                        'rdaw': 'http://rdaregistry.info/Elements/w/',
                                        'rdaw:replacedByWork': {'@type': '@id'},
                                        'rdaw:replacementOfWork': {'@type': '@id'},
                                        'xsd': 'http://www.w3.org/2001/XMLSchema#'},
                           '@graph': [{'@id': u'http://127.0.0.1:5050/publication/fs07199',
                                       '@type': 'rdac:Work',
                                       'dc:date': '1999',
                                       'dc:title': u'U.S. Geological Survey World Wide Web Information'},
                                      {'@id': u'http://127.0.0.1:5050/publication/fs12196',
                                       '@type': 'rdac:Work',
                                       'dc:date': u'1997',
                                       'dc:title': u'U.S. Geological Survey World Wide Web information',
                                       'rdaw:replacedByWork': u'http://127.0.0.1:5050/publication/fs07199'},
                                      {'@id': u'http://127.0.0.1:5050/publication/fs05503',
                                       '@type': 'rdac:Work',
                                       'dc:date': u'2003',
                                       'dc:title': u'U.S. Geological Survey World Wide Web Information',
                                       'rdaw:replacementOfWork': u'http://127.0.0.1:5050/publication/fs07199'}]},
         u'seriesNumber': u'071-99',
         u'seriesTitle': {u'id': 313,
                          u'onlineIssn': u'2327-6932',
                          u'printIssn': u'2327-6916',
                          u'text': u'Fact Sheet'},
         u'supersededBy': {u'id': 53167,
                           u'indexId': u'fs05503',
                           u'publicationYear': u'2003',
                           u'text': u'fs05503 - 2003 - U.S. Geological Survey World Wide Web Information',
                           u'title': u'U.S. Geological Survey World Wide Web Information'},
         u'text': u'fs07199 - 1999 - U.S. Geological Survey World Wide Web Information',
         u'title': u'U.S. Geological Survey World Wide Web Information',
         u'usgsCitation': u'U.S. Geological Survey World Wide Web Information; 1999; FS; 071-99; Geological Survey (U.S.)'}

    assert_equal(world.superseded_publication_record_with_graph, expected_record)