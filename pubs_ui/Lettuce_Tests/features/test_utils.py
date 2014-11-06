import httpretty
from nose.tools import assert_equal
from lettuce import *
import json
from requests import get
from pubs_ui.utils import pull_feed, pubdetails, getbrowsecontent, create_display_links

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

@step(r'I point to a live feed url on the wiki')
def live_url(step):
    world.feed_url = r'https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=pubswarehouseinfo&title=myUSGS+4.0+RSS+Feed&labelString=other_resources&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed'

@step(r'I define what ouput we would normally expect from this page')
def live_output(step):
    world.expected_output = '<html><body><div class="feed"> \n<div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 10px;">\n<h4 id="OtherResources-Ordering:">Ordering:</h4><p><a class="external-link" href="http://www.usgs.gov/pubprod/" rel="nofollow">Maps, Imagery, and Publications Home Page</a><br/><a class="external-link" href="http://www.usgs.gov/pubprod/maps.html" rel="nofollow">Maps, Imagery, and Publications &gt; Maps</a></p><h4 id="OtherResources-Borrowing:">Borrowing:</h4><p><a class="external-link" href="http://www.usgs.gov/library" rel="nofollow">USGS Library</a><br/><a class="external-link" href="http://www.gpoaccess.gov/libraries.html" rel="nofollow">GPO Access: Federal Depository Libraries</a><br/><a class="external-link" href="http://www.worldcat.org/" rel="nofollow">WorldCat</a></p><h4 id="OtherResources-AskAnExpert:">Ask An Expert:</h4><p>Ask USGS<br/>USGS Contact Us<br/>Natural Science Information Home Page<br/>USGS Library: Ask a Librarian<br/>USGS TerraWeb for KIDS!</p><h4 id="OtherResources-Other:">Other:</h4><p>USGS Real-Time Data Search Assistance<br/>Maps, Imagery, and Publications &gt; Aerial Photographs and Satellite Image</p>\n</div>\n\n</div></body></html>'
    
@step(r'I run pull_feed under normal circumstances')
def run_pull_feed(step):
    world.output = pull_feed(world.feed_url)

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
    world.expected_output = {u'publicationType': {u'text': u'Report', u'id': 18}, u'publicationYear': u'1880', 'details': [{'Publication type:': u'Report'}]}

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
    world.expected_output = 1680

###display-link scenarios###
@step(r'I have a fake json full of pubs-related links')
def mock_pubs_links(step):
    world.body = json.loads('{"links":[{"id":5277443,"rank":0,"type":{"id":24,"text":"Thumbnail"},"url":"http://pubs.usgs.gov/ar/01/report-thumb.jpg"},{"id":5166317,"rank":300,"type":{"id":11,"text":"Document"},"url":"http://pubs.usgs.gov/ar/01/report.pdf","linkFileType":{"id":1,"text":"pdf"}},{"id":5344307,"rank":400,"type":{"id":17,"text":"Plate"},"url":"http://pubs.usgs.gov/ar/01/plate-1.pdf","size":"9056","linkFileType":{"id":1,"text":"pdf"}}]}')
    
@step(r'I create_display_links using the dummy list')
def display_links(step):
    world.output = create_display_links(world.body)
    world.expected_output = {'displayLinks': {'Plate': [{u'url': u'http://pubs.usgs.gov/ar/01/plate-1.pdf', 'text': u'Plate 1', u'rank': 1, u'type': {u'text': u'Plate', u'id': 17}, u'id': 5344307, u'linkFileType': {u'text': u'pdf', u'id': 1}, u'size': u'9056'}], 'Document': [{u'url': u'http://pubs.usgs.gov/ar/01/report.pdf', u'linkFileType': {u'text': u'pdf', u'id': 1}, u'type': {u'text': u'Document', u'id': 11}, u'id': 5166317, u'rank': 300}], 'Thumbnail': [{u'url': u'http://pubs.usgs.gov/ar/01/report-thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 5277443, u'rank': 0}], 'Index Page': []}, u'links': [{u'url': u'http://pubs.usgs.gov/ar/01/report-thumb.jpg', u'type': {u'text': u'Thumbnail', u'id': 24}, u'id': 5277443, u'rank': 0}, {u'url': u'http://pubs.usgs.gov/ar/01/report.pdf', u'linkFileType': {u'text': u'pdf', u'id': 1}, u'type': {u'text': u'Document', u'id': 11}, u'id': 5166317, u'rank': 300}, {u'url': u'http://pubs.usgs.gov/ar/01/plate-1.pdf', 'text': u'Plate 1', u'rank': 1, u'type': {u'text': u'Plate', u'id': 17}, u'id': 5344307, u'linkFileType': {u'text': u'pdf', u'id': 1}, u'size': u'9056'}]}

@step(r'I am given a list of links for use in the jinja template')
def test_links_ouput(step):
    assert_equal(world.output, world.expected_output)

@step(r"I create_display_links from the pub's response")
def live_display_links(step):
    world.output = len(create_display_links(get(world.live_url).json()))
    world.expected_output = 20 #check all necessary components are there.

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
    world.output = str(getbrowsecontent(world.url))
    httpretty.disable()
    httpretty.reset()

@step(r"I am returned a list for the links, breadcrumbs, and titles")
def test_content(step):
    assert_equal(world.output, world.expected_output)

@step(r"I point to a real pubs browse url")
def make_url(step):
    world.url = "http://pubs.er.usgs.gov/browse"
    world.expected_output = '{\'breadcrumbs\': [u\'\\n\', <a href="browse">Browse USGS Pubs Warehouse</a>, u\'\\n\'], \'links\': [u\'\\n\', <ul>\n<li><a alt="Official USGS Publications" href="browse/usgs-publications">Official USGS Publications</a></li>\n<li><a alt="Scientific Journal Articles by USGS Authors" href="browse/journals/all/">Scientific Journal Articles by USGS Authors</a></li>\n<li><a alt="Other US Government Publications" href="browse/other-pubs/all/">Other US Government Publications</a></li>\n<li><a alt="State, Local, and other government publications" href="browse/state-local/all/">State, Local, and other government publications</a></li>\n<li><a alt="Books, Reports, Conference Proceedings and other publications" href="browse/books-reports-conference/all/">Books, Reports, Conference Proceedings and other publications</a></li>\n</ul>, u\'\\n\'], \'header\': [u\'Please select a category of interest\']}'

    
