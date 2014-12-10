import httpretty
from nose.tools import assert_equal
from lettuce import *
import json
from requests import get
from pubs_ui.utils import pull_feed, pubdetails, getbrowsecontent, create_display_links, jsonify_geojson, add_supersede_pubs

###pull_feed scenarios###
@step(r'I have created a mock xml at a mock url')
def create_mock(step):
    #This is a really long raw string meant to mock the type of xml we would find on the confluence wiki
    mock_xml = """<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><title>TEST_XML</title><link rel="alternate" href="https://my.usgs.gov/confluence" /><subtitle>Imitation of Confluence Syndication Feed</subtitle><id>https://my.usgs.gov/confluence</id><entry><title>Test Resources</title><link rel="alternate" href="https://my.usgs.gov/confluence/display/pubswarehouseinfo/Other+Resources" /><category term="other_resources" /><author><name>Steve K</name></author><id>tag:my.usgs.gov,2009:page-test-page</id><updated>2014-09-26T02:34:53Z</updated><published>2014-09-26T02:34:53Z</published><summary type="html">&lt;div class="feed"&gt;&lt;p&gt;Page&lt;b&gt;edited&lt;/b&gt; by&lt;a href="https://my.usgs.gov/confluence/display/~jkreft@usgs.gov"&gt;Steve K&lt;/a&gt;&lt;/p&gt;&lt;div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;padding: 10px;"&gt;&lt;h4 id="OtherResources-Ordering:"&gt;Ordering:&lt;/h4&gt;&lt;p&gt;&lt;ahref="http://www.usgs.gov/pubprod/" class="external-link" rel="nofollow"&gt; All this test text &lt;/p&gt;&lt;/div&gt;&lt;div style="padding: 10px 0;"&gt;&lt;a href="https://my.usgs.gov/confluence/display/pubswarehouseinfo/Other+Resources"&gt;View Online&lt;/a&gt;&amp;middot;&lt;ahref="https://my.usgs.gov/confluence/pages/diffpagesbyversion.action?pageId=518425134&amp;revisedVersion=3&amp;originalVersion=2"&gt;View Changes Online&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;</summary><dc:creator>Steve K</dc:creator><dc:date>2014-09-26T02:34:53Z</dc:date></entry></feed>"""
    #enabling httpretty
    httpretty.reset()
    httpretty.enable()
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
    httpretty.disable()
    httpretty.reset()
    
###pubdetails scenarios###
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
    world.live_url = 'http://pubs.er.usgs.gov/pubs-services/publication/ar1'

@step(r'When I find real details with pubdetails')
def get_first_details(step):
    r = get(world.live_url)
    json = r.json()
    world.output = len(str(pubdetails(json))) #Measure json lengths (as strings) since there is a lot of data
    world.expected_output = 1748

###display-link scenarios###
@step(r'I have a fake json full of pubs-related links')
def mock_pubs_links(step):
    world.body = json.loads('{"links":[{"id":5277443,"rank":0,"type":{"id":24,"text":"Thumbnail"},"url":"http://pubs.usgs.gov/ar/01/report-thumb.jpg"},{"id":5166317,"rank":300,"type":{"id":11,"text":"Document"},"url":"http://pubs.usgs.gov/ar/01/report.pdf","linkFileType":{"id":1,"text":"pdf"}},{"id":5344307,"rank":400,"type":{"id":17,"text":"Plate"},"url":"http://pubs.usgs.gov/ar/01/plate-1.pdf","size":"9056","linkFileType":{"id":1,"text":"pdf"}}]}')
    
@step(r'I create_display_links using the dummy list')
def display_links(step):
    world.output = create_display_links(world.body)
    world.expected_output = {'displayLinks': {'Project Site': [], 'Application Site': [], 'Raw Data': [], 'Document': [{u'url': u'http://pubs.usgs.gov/ar/01/report.pdf', u'linkFileType': {u'text': u'pdf', u'id': 1}, u'type': {u'text': u'Document', u'id': 11}, u'id': 5166317, u'rank': 300}], 'Thumbnail': [{u'url': u'http://pubs.usgs.gov/ar/01/report-thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 5277443, u'rank': 0}], 'Metadata': [], 'Plate': [{u'url': u'http://pubs.usgs.gov/ar/01/plate-1.pdf', 'text': u'Plate 1', u'rank': 1, u'type': {u'text': u'Plate', u'id': 17}, u'id': 5344307, u'linkFileType': {u'text': u'pdf', u'id': 1}, u'size': u'9056'}], 'Spatial Data': [], 'Companion Files': [], 'Illustration': [], 'Appendix': [], 'Index Page': [], 'Chapter': [], 'Read Me': [], 'Version History': [], 'Database': [], 'Cover': [], 'Authors Website': [], 'Errata': [], 'Additional Report Piece': [], 'Related Work': [], 'Abstract': [], 'Referenced Work': [], 'Digital Object Identifier': [], 'Image': []}, u'links': [{u'url': u'http://pubs.usgs.gov/ar/01/report-thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 5277443, u'rank': 0}, {u'url': u'http://pubs.usgs.gov/ar/01/report.pdf', u'linkFileType': {u'text': u'pdf', u'id': 1}, u'type': {u'text': u'Document', u'id': 11}, u'id': 5166317, u'rank': 300}, {u'url': u'http://pubs.usgs.gov/ar/01/plate-1.pdf', 'text': u'Plate 1', u'rank': 1, u'type': {u'text': u'Plate', u'id': 17}, u'id': 5344307, u'linkFileType': {u'text': u'pdf', u'id': 1}, u'size': u'9056'}]}
@step(r'I am given a list of links for use in the jinja template')
def test_links_ouput(step):
    assert_equal(world.output, world.expected_output)

@step(r"I create_display_links from the pub's response")
def live_display_links(step):
    world.output = len(create_display_links(get(world.live_url).json()))
    world.expected_output = 21 #check all necessary components are there.

###getbrowsecontent scenarios###
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
    world.url = "http://pubs.er.usgs.gov/browse"
    world.expected_output = '{\'breadcrumbs\': [u\'\\n\', <a href="browse">Browse USGS Pubs Warehouse</a>, u\'\\n\'], \'links\': [u\'\\n\', <ul>\n<li><a alt="Official USGS Publications" href="browse/usgs-publications">Official USGS Publications</a></li>\n<li><a alt="Scientific Journal Articles by USGS Authors" href="browse/journals/all/">Scientific Journal Articles by USGS Authors</a></li>\n<li><a alt="Other US Government Publications" href="browse/other-pubs/all/">Other US Government Publications</a></li>\n<li><a alt="State, Local, and other government publications" href="browse/state-local/all/">State, Local, and other government publications</a></li>\n<li><a alt="Books, Reports, Conference Proceedings and other publications" href="browse/books-reports-conference/all/">Books, Reports, Conference Proceedings and other publications</a></li>\n</ul>, u\'\\n\'], \'header\': [u\'Please select a category of interest\']}'

###jsonify_geojson scenarios###
@step(r'we have created a fake pubs record with a geographic extents string')
def imitation_geojson(step):
    world.body = {'id': 12345, "geographicExtents": '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [ [ [ -72.745833,44.0625 ], [ -72.745833,44.075 ], [ -72.741667,44.075 ], [ -72.741667,44.0625 ], [ -72.745833,44.0625 ] ] ] } } ] }'}

@step(r'I make a record with parsable json')
def make_json(step):
    world.output = jsonify_geojson(world.body)
    world.expected_output = {'id': 12345, "geographicExtents": {u'type': u'FeatureCollection', u'features': [{u'geometry': {u'type': u'Polygon', u'coordinates': [[[-72.745833, 44.0625], [-72.745833, 44.075], [-72.741667, 44.075], [-72.741667, 44.0625], [-72.745833, 44.0625]]]}, u'type': u'Feature', u'properties': {}}]}}

@step(r'I see a record was created correctly')
def test_geojson_output(step):
    assert_equal(world.output, world.expected_output)

@step(r'we have created a fake pubs record with an invalid geographic extents string')
def imitation_bad_geojson(step):
    world.body = {'id': 12345, "geographicExtents": '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [ [ [ -72.745833,44.0625 ], [ -72.745833,44.075 ], [ -72.741667,44.075 ], [ -72.741667,44.0625 ], [ -72.745833,44.0625 ] ] ] } } ] '}

@step(r'I try to make a record with parseable json and catch an error')
def make_json(step):
    world.output = jsonify_geojson(world.body)
    world.expected_output = {'id': 12345}

@step(r'I see the record has geographicExtents dropped')
def test_geojson_output(step):
    assert_equal(world.output, world.expected_output)

@step(u'Given I have a static Python representation of JSON data for a publication known to have related superseding or preceding publications')
def given_i_have_a_static_python_representation_of_json_data_for_a_publication_known_to_have_related_superseding_or_preceding_publications(step):
    
    fs03301_pubdata_json = '{"id":30722,"lastModifiedDate":"2014-04-03T08:41:19.000","indexId":"fs03301","displayToPublicDate":"2001-07-01T00:00:00.000","publicationYear":"2001","publicationType":{"id":18,"text":"Report"},"publicationSubtype":{"id":5,"text":"USGS Numbered Series"},"seriesTitle":{"id":313,"text":"Fact Sheet","onlineIssn":"2327-6932","printIssn":"2327-6916"},"seriesNumber":"033-01","title":"U.S. Geological Survey World Wide Web Information","docAbstract":"The U.S. Geological Survey (USGS) invites\\nyou to explore an earth science virtual library\\nof digital information, publications, and data.\\nThe USGS World Wide Web sites offer an\\narray of information that reflects scientific\\nresearch and monitoring programs conducted\\nin the areas of natural hazards, environmental\\nresources, and cartography. This list\\nprovides gateways to access a cross section of\\nthe digital information on the USGS World\\nWide Web sites.","language":"English","publisher":"U.S. Geological Survey","publisherLocation":"Reston, VA","usgsCitation":"U.S. Geological Survey World Wide Web Information; 2001; FS; 033-01; U.S. Geological Survey","productDescription":"2 p.","numberOfPages":"2","authors":[{"contributorId":59386,"corporation":true,"usgs":true,"id":203794,"contributorType":{"id":1,"text":"Authors"},"rank":1}],"editors":[],"costCenters":[],"links":[{"id":5252714,"rank":0,"type":{"id":24,"text":"Thumbnail"},"url":"http://pubs.er.usgs.gov/thumbnails/fs03301.jpg"},{"id":5386208,"type":{"id":11,"text":"Document"},"url":"http://pubs.usgs.gov/fs/0033-01/report.pdf"}],"edition":"Supersedes FS 037-00 & Superseded by FS 055-03"}'
    
    world.fs03301_pubdata_python = json.loads(fs03301_pubdata_json)

@step(u'When I pass it to add_supersede_pubs')
def when_i_pass_it_to_add_supersede_pubs(step):

    # invoke the function we're testing
    world.fs03301_pubdata_with_supersede = add_supersede_pubs(world.fs03301_pubdata_python)

@step(u'Then I receive a copy that is identical except for the addition of the link information')
def then_i_receive_a_copy_that_is_identical_except_for_the_addition_of_the_link_information(step):

    # less unwieldy variable name
    pubsdata = world.fs03301_pubdata_with_supersede

    # list of relationship graphs inserted for supersede data
    graphs = pubsdata['relationships']['graphs']

    pubs_that_supersede_context = []
    pubs_superseded_by_context = []
    for graph in graphs:
        # each graph is a single-item dict, with a fixed key of @graph
        # and a value of [context_pub, related_pub]
        graph_pubs = graph['@graph']
        context_pub = graph_pubs[0]

        if 'rdaw:replacedByWork' in context_pub:
            pubs_that_supersede_context.append(graph_pubs[0]['rdaw:replacedByWork'])
        elif 'rdaw:replacementOfWork' in context_pub:
            pubs_superseded_by_context.append(graph_pubs[0]['rdaw:replacementOfWork'])

    # expected additions
    assert u'http://pubs.er.usgs.gov/publication/fs07199' in pubs_superseded_by_context
    assert u'http://pubs.er.usgs.gov/publication/fs03700' in pubs_superseded_by_context
    assert u'http://pubs.er.usgs.gov/publication/fs05503' in pubs_that_supersede_context

    # did the process damage the rest of the pubs data?
    prior_pubsdata =  world.fs03301_pubdata_python
    for keyname in prior_pubsdata:
        assert keyname in pubsdata
        assert prior_pubsdata[keyname] == pubsdata[keyname]
