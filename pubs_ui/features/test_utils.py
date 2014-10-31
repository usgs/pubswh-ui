import unittest
import httpretty
from nose.tools import assert_equal
from lettuce import *
#from pubs_ui import utils
import utils

###pull_feed scenarios###
@step(r'I have created a mock url')
def create_mock(step):
    #This is a really long raw string meant to mock the type of xml we would find on the confluence wiki
    world.mock_xml = r'<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><title>TEST_XML</title><link rel="alternate" href="https://my.usgs.gov/confluence" /><subtitle>Imitation of Confluence Syndication Feed</subtitle><id>https://my.usgs.gov/confluence</id><entry><title>Test Resources</title><link rel="alternate" href="https://my.usgs.gov/confluence/display/pubswarehouseinfo/Other+Resources" /><category term="other_resources" /><author><name>Steve K</name></author><id>tag:my.usgs.gov,2009:page-test-page</id><updated>2014-09-26T02:34:53Z</updated><published>2014-09-26T02:34:53Z</published><summary type="html">&lt;div class="feed"&gt;&lt;p&gt;Page&lt;b&gt;edited&lt;/b&gt; by&lt;a href="https://my.usgs.gov/confluence/display/~jkreft@usgs.gov"&gt;Steve K&lt;/a&gt;&lt;/p&gt;&lt;div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;padding: 10px;"&gt;&lt;h4 id="OtherResources-Ordering:"&gt;Ordering:&lt;/h4&gt;&lt;p&gt;&lt;ahref="http://www.usgs.gov/pubprod/" class="external-link" rel="nofollow"&gt; All this test text &lt;/p&gt;&lt;/div&gt;&lt;div style="padding: 10px 0;"&gt;&lt;a href="https://my.usgs.gov/confluence/display/pubswarehouseinfo/Other+Resources"&gt;View Online&lt;/a&gt;&amp;middot;&lt;ahref="https://my.usgs.gov/confluence/pages/diffpagesbyversion.action?pageId=518425134&amp;revisedVersion=3&amp;originalVersion=2"&gt;View Changes Online&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;</summary><dc:creator>Steve K</dc:creator><dc:date>2014-09-26T02:34:53Z</dc:date></entry></feed>'

@step(r'I register the mock xml and feed it to pull_feed')
def enable_mock(step):
    #enabling httpretty 
    httpretty.enable()
    httpretty.register_uri(httpretty.GET, "http://test_url/test",
                                             body = world.mock_xml)
    world.output = utils.pull_feed("http://test_url/test")

@step(r'I defined the output we would expect for the mock from pull_feed')
def mock_output(step):
    world.expected_output = r'<html><body><div class="feed"><div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 10px;"><h4 id="OtherResources-Ordering:">Ordering:</h4><p> All this test text </p></div></div></body></html>'

@step(r'I point to a live feed url on the wiki')
def live_url(step):
    world.feed_url = r'https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=pubswarehouseinfo&title=myUSGS+4.0+RSS+Feed&labelString=other_resources&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed'

@step(r'I define what ouput we would normally expect from this page')
def live_output(step):
    world.expected_output = u'<html><body><div class="feed"> \n<div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 10px;">\n<h4 id="OtherResources-Ordering:">Ordering:</h4><p><a class="external-link" href="http://www.usgs.gov/pubprod/" rel="nofollow">Maps, Imagery, and Publications Home Page</a><br/><a class="external-link" href="http://www.usgs.gov/pubprod/maps.html" rel="nofollow">Maps, Imagery, and Publications &gt; Maps</a></p><h4 id="OtherResources-Borrowing:">Borrowing:</h4><p><a class="external-link" href="http://www.usgs.gov/library" rel="nofollow">USGS Library</a><br/><a class="external-link" href="http://www.gpoaccess.gov/libraries.html" rel="nofollow">GPO Access: Federal Depository Libraries</a><br/><a class="external-link" href="http://www.worldcat.org/" rel="nofollow">WorldCat</a></p><h4 id="OtherResources-AskAnExpert:">Ask An Expert:</h4><p>Ask USGS<br/>USGS Contact Us<br/>Natural Science Information Home Page<br/>USGS Library: Ask a Librarian<br/>USGS TerraWeb for KIDS!</p><h4 id="OtherResources-Other:">Other:</h4><p>USGS Real-Time Data Search Assistance<br/>Maps, Imagery, and Publications &gt; Aerial Photographs and Satellite Image</p>\n</div>\n\n</div></body></html>'    

@step(r'I run pull_feed under normal circumstances')
def run_pull_feed(step):
    world.output = utils.pull_feed(world.feed_url)

@step(r'I see that pull_feed gave the expected output')
def test_pull_feed(step):
    assert_equal(world.expected_output, world.output)
    httpretty.disable()
