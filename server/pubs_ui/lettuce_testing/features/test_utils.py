# pylint: disable=W0621,W0613,C0111,C0103,C0302,C0301

import json

import httpretty
from lettuce import step, world
from nose.tools import assert_equal, assert_items_equal
from requests import get

from pubs_ui import app
from pubs_ui.pubswh.utils import (
    pull_feed, pubdetails, create_display_links,
    update_geographic_extents, add_relationships_graphs, SearchPublications,
    make_contributor_list, sort_list_of_dicts,
    extract_related_pub_info, munge_abstract
)


#
# pull_feed scenarios
#

@step(r'I have created a mock xml at a mock url')
def create_mock(step):
    # enabling httpretty
    httpretty.reset()
    httpretty.enable()
    # This is a really long raw string meant to mock the type of xml we would find on the confluence wiki
    mock_xml = """<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><title>TEST_XML</title><link rel="alternate" href="https://my.usgs.gov/confluence" /><subtitle>Imitation of Confluence Syndication Feed</subtitle><id>https://my.usgs.gov/confluence</id><entry><title>Test Resources</title><link rel="alternate" href="https://my.usgs.gov/confluence/display/pubswarehouseinfo/Other+Resources" /><category term="other_resources" /><author><name>Steve K</name></author><id>tag:my.usgs.gov,2009:page-test-page</id><updated>2014-09-26T02:34:53Z</updated><published>2014-09-26T02:34:53Z</published><summary type="html">&lt;div class="feed"&gt;&lt;p&gt;Page&lt;b&gt;edited&lt;/b&gt; by&lt;a href="https://my.usgs.gov/confluence/display/~jkreft@usgs.gov"&gt;Steve K&lt;/a&gt;&lt;/p&gt;&lt;div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;padding: 10px;"&gt;&lt;h4 id="OtherResources-Ordering:"&gt;Ordering:&lt;/h4&gt;&lt;p&gt;&lt;ahref="http://www.usgs.gov/pubprod/" class="external-link" rel="nofollow"&gt; All this test text &lt;/p&gt;&lt;/div&gt;&lt;div style="padding: 10px 0;"&gt;&lt;a href="https://my.usgs.gov/confluence/display/pubswarehouseinfo/Other+Resources"&gt;View Online&lt;/a&gt;&amp;middot;&lt;ahref="https://my.usgs.gov/confluence/pages/diffpagesbyversion.action?pageId=518425134&amp;revisedVersion=3&amp;originalVersion=2"&gt;View Changes Online&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;</summary><dc:creator>Steve K</dc:creator><dc:date>2014-09-26T02:34:53Z</dc:date></entry></feed>"""
    httpretty.register_uri(httpretty.GET, "http://test_url/test", body=mock_xml)


@step(r'I pull_feed the fake url')
def enable_mock(step):
    world.output = pull_feed("http://test_url/test")


@step(r'I defined the output we would expect for the mock from pull_feed')
def mock_output(step):
    world.expected_output = '<html><body><div class="feed"><div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 10px;"><h4 id="OtherResources-Ordering:">Ordering:</h4><p> All this test text </p></div></div></body></html>'


@step(r'I see that pull_feed gave the expected output')
def test_pull_feed(step):
    assert_equal(world.expected_output, world.output)
    httpretty.reset()
    httpretty.disable()


#
# pubdetails scenarios
#

@step(r'I have some fake json pubs metadata')
def set_mock_pubs(step):
    # test_url = "http://test_url/test/publication/a1"
    world.body = json.loads('{"publicationYear":"1880","publicationType":{"id":18,"text":"Report"}}')


@step(r'I find fake details with pubdetails')
def get_pubdetails(step):
    world.output = pubdetails(world.body)
    world.expected_output = {'publicationType': {'text': 'Report', 'id': 18}, 'publicationYear': '1880', 'details': [{'Publication type:': 'Report'}, {'Year Published:': '1880'}]}


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
    world.output = len(str(pubdetails(json)))  # Measure json lengths (as strings) since there is a lot of data
    world.expected_output = 2089


#
# display-link scenarios
#

@step(r'I have a fake json full of pubs-related links')
def mock_pubs_links(step):
    world.body = json.loads('{"links":[{"id":5277443,"rank":0,"type":{"id":24,"text":"Thumbnail"},"url":"http://pubs.usgs.gov/ar/01/report-thumb.jpg"},{"id":5166317,"rank":300,"type":{"id":11,"text":"Document"},"url":"http://pubs.usgs.gov/ar/01/report.pdf","linkFileType":{"id":1,"text":"pdf"}},{"id":5344307,"rank":400,"type":{"id":17,"text":"Plate"},"url":"http://pubs.usgs.gov/ar/01/plate-1.pdf","size":"9056","linkFileType":{"id":1,"text":"pdf"}}]}')


@step(r'I create_display_links using the dummy list')
def display_links(step):
    world.output = create_display_links(world.body)
    world.expected_output = {
        'displayLinks': {
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
            'Document': [{
                'id': 5166317,
                'linkFileType': {'id': 1, 'text': 'pdf'},
                'rank': 300,
                'type': {'id': 11, 'text': 'Document'},
                'url': 'http://pubs.usgs.gov/ar/01/report.pdf'
            }],
            'Errata': [],
            'Figure': [],
            'Illustration': [],
            'Image': [],
            'Index Page': [],
            'Metadata': [],
            'Plate': [{
                'id': 5344307,
                'linkFileType': {'id': 1, 'text': 'pdf'},
                'rank': 1,
                'size': '9056',
                'text': 'Plate 1',
                'type': {'id': 17, 'text': 'Plate'},
                'url': 'http://pubs.usgs.gov/ar/01/plate-1.pdf'
            }],
            'Project Site': [],
            'Raw Data': [],
            'Read Me': [],
            'Referenced Work': [],
            'Related Work': [],
            'Spatial Data': [],
            'Sheet': [],
            'Table': [],
            'Dataset': [],
            'Thumbnail': [{
                'id': 5277443,
                'rank': 0,
                'type': {
                    'id': 24,
                    'text': 'Thumbnail'
                },
                'url': 'http://pubs.usgs.gov/ar/01/report-thumb.jpg'
            }],
            'Version History': [],
            'Data Release': []
        },
        'links': [{
            'id': 5277443,
            'rank': 0,
            'type': {'id': 24, 'text': 'Thumbnail'},
            'url': 'http://pubs.usgs.gov/ar/01/report-thumb.jpg'
        }, {
            'id': 5166317,
            'linkFileType': {'id': 1, 'text': 'pdf'},
            'rank': 300,
            'type': {'id': 11, 'text': 'Document'},
            'url': 'http://pubs.usgs.gov/ar/01/report.pdf'
        }, {
            'id': 5344307,
            'linkFileType': {'id': 1, 'text': 'pdf'},
            'rank': 400,
            'size': '9056',
            'type': {'id': 17, 'text': 'Plate'},
            'url': 'http://pubs.usgs.gov/ar/01/plate-1.pdf'
        }],
        'pubHasNoLinks': False
    }


@step(r'I am given a list of links for use in the jinja template')
def test_links_ouput(step):
    assert_equal(world.output, world.expected_output)


@step(r"I create_display_links from the pub's response")
def live_display_links(step):
    world.output = len(create_display_links(get(world.live_url).json()))
    world.expected_output = 26  # check all necessary components are there.


#
# manipulate links scenarios
#

@step(r'I have a index page links that point to USGS and NGMDB')
def imitation_links_data(step):
    world.original_index_display_links = {
        'links': [{
            'id': 5396477,
            'type': {
                'id': 23, 'text': 'Spatial Data'
            },
            'url': 'http://pubs.usgs.gov/sim/3310/GIS_files'
        }, {
            'id': 5396475,
            'type': {'id': 17, 'text': 'Plate'},
            'url': 'http://pubs.usgs.gov/sim/3310/pdf/sim3310_sheet1.pdf'
        }, {
            'id': 5396476,
            'type': {'id': 17, 'text': 'Plate'},
            'url': 'http://pubs.usgs.gov/sim/3310/pdf/sim3310_sheet2.pdf'
        }, {
            'id': 5396470,
            'type': {'id': 15, 'text': 'Index Page'},
            'url': 'http://pubs.usgs.gov/sim/3310/'
        }, {
            'id': 5396470,
            'type': {'id': 15, 'text': 'Index Page'},
            'url': 'http://ngmdb.usgs.gov/sim/3310/'
        }, {
            'id': 5396478,
            'type': {'id': 24, 'text': 'Thumbnail'},
            'url': 'http://pubs.er.usgs.gov/thumbnails/sim3310.jpg'
        }]
    }


@step(r'I manipulate the links with create display links')
def create_display_links_with_index_pages(step):
    world.displaylinks_output = create_display_links(world.original_index_display_links)
    world.expected_displaylinks_output = {
        'displayLinks': {
            'Abstract': [],
            'Additional Report Piece': [],
            'Appendix': [],
            'Application Site': [],
            'Authors Website': [],
            'Chapter': [],
            'Companion Files': [],
            'Cover': [],
            'Database': [],
            'Data Release': [],
            'Digital Object Identifier': [],
            'Document': [],
            'Errata': [],
            'Figure': [],
            'Illustration': [],
            'Image': [],
            'Index Page': [{
                'id': 5396470,
                'rank': 1,
                'text': 'USGS Index Page',
                'type': {'id': 15, 'text': 'Index Page'},
                'url': 'http://pubs.usgs.gov/sim/3310/'
            }, {
                'id': 5396470,
                'rank': 2,
                'text': 'National Geologic Map Database Index Page',
                'type': {'id': 15, 'text': 'Index Page'},
                'url': 'http://ngmdb.usgs.gov/sim/3310/'
            }],
            'Metadata': [],
            'Plate': [{
                'id': 5396475,
                'linkFileType': {'text': 'pdf'},
                'rank': 1,
                'text': 'Sheet 1',
                'type': {'id': 17, 'text': 'Plate'},
                'url': 'http://pubs.usgs.gov/sim/3310/pdf/sim3310_sheet1.pdf'
            }, {
                'id': 5396476,
                'linkFileType': {'text': 'pdf'},
                'rank': 2,
                'text': 'Sheet 2',
                'type': {'id': 17, 'text': 'Plate'},
                'url': 'http://pubs.usgs.gov/sim/3310/pdf/sim3310_sheet2.pdf'
            }],
            'Project Site': [],
            'Raw Data': [],
            'Read Me': [],
            'Referenced Work': [],
            'Related Work': [],
            'Sheet': [],
            'Table': [],
            'Dataset': [],
            'Spatial Data': [{
                'id': 5396477,
                'rank': 1,
                'type': {
                    'id': 23,
                    'text': 'Spatial Data'
                },
                'url': 'http://pubs.usgs.gov/sim/3310/GIS_files'
            }],
            'Thumbnail': [{
                'id': 5396478,
                'rank': 1,
                'type': {'id': 24, 'text': 'Thumbnail'},
                'url': 'http://pubs.er.usgs.gov/thumbnails/sim3310.jpg'
            }],
            'Version History': []
        },
        'links': [{
            'id': 5396477,
            'type': {'id': 23, 'text': 'Spatial Data'},
            'url': 'http://pubs.usgs.gov/sim/3310/GIS_files'
        }, {
            'id': 5396475,
            'type': {'id': 17, 'text': 'Plate'},
            'url': 'http://pubs.usgs.gov/sim/3310/pdf/sim3310_sheet1.pdf'
        }, {
            'id': 5396476,
            'type': {'id': 17, 'text': 'Plate'},
            'url': 'http://pubs.usgs.gov/sim/3310/pdf/sim3310_sheet2.pdf'
        }, {
            'id': 5396470,
            'type': {'id': 15, 'text': 'Index Page'},
            'url': 'http://pubs.usgs.gov/sim/3310/'
        }, {
            'id': 5396470,
            'type': {'id': 15, 'text': 'Index Page'},
            'url': 'http://ngmdb.usgs.gov/sim/3310/'
        }, {
            'id': 5396478,
            'type': {'id': 24, 'text': 'Thumbnail'},
            'url': 'http://pubs.er.usgs.gov/thumbnails/sim3310.jpg'
        }],
        'pubHasNoLinks': False
    }


@step(r'I get the rejiggered display links that I expect')
def test_displaylinks_output(step):
    assert_equal(world.expected_displaylinks_output, world.displaylinks_output)


#
# update_geographic_extents scenarios
#

@step(r'we have created a fake pubs record with a geographic extents string')
def imitation_geojson(step):
    world.body = {'id': 12345, 'title': 'The Title', 'indexId': 'pubIndexId', 'publicationYear': '1995', 'publicationType': 'Report',
                  "geographicExtents": '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [ [ [ -72.745833,44.0625 ], [ -72.745833,44.075 ], [ -72.741667,44.075 ], [ -72.741667,44.0625 ], [ -72.745833,44.0625 ] ] ] } } ] }'}


@step(r'I make a record with parsable json')
def make_json(step):
    world.output = world.body
    update_geographic_extents(world.output)
    world.expected_output = {
        'geographicExtents': {
            'features': [{
                'geometry': {
                    'coordinates': [[[-72.745833, 44.0625],
                                      [-72.745833, 44.075], [-72.741667, 44.075],
                                      [-72.741667, 44.0625], [-72.745833, 44.0625]]],
                    'type': 'Polygon'
                },
                'id': 'pubIndexId.base_id',
                'properties': {
                    'id': 'pubIndexId',
                    'info': '1995',
                    'title': 'The Title',
                    'url': app.config.get('JSON_LD_ID_BASE_URL') + 'publication/pubIndexId',
                    'year': '1995',
                },
                'type': 'Feature',
            }],
            'properties': {'title': 'The Title'},
            'type': 'FeatureCollection'
        },
        'id': 12345,
        'indexId': 'pubIndexId',
        'publicationType': 'Report',
        'publicationYear': '1995',
        'title': 'The Title'
    }


@step(r'I see a record was created correctly')
def test_geojson_output(step):
    assert_equal(world.output, world.expected_output)


@step(r'we have created a fake pubs record with an invalid geographic extents string')
def imitation_bad_geojson(step):
    world.body = {'id': 12345, "geographicExtents": '{ "type": "FeatureCollection",  "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [ [ [ -72.745833,44.0625 ], [ -72.745833,44.075 ], [ -72.741667,44.075 ], [ -72.741667,44.0625 ], [ -72.745833,44.0625 ] ] ] } } ] '}


@step(r'I try to make a record with parseable json and catch an error')
def make_json(step):
    world.output = world.body
    update_geographic_extents(world.output)
    world.expected_output = {'id': 12345}


@step(r'I see the record has geographicExtents dropped')
def test_geojson_output(step):
    assert_equal(world.output, world.expected_output)


#
# pub relationship scenarios
#

@step(r'I have a mocked base publication record, a base url, and a mocked legacy endpoint')
def given_i_have_a_static_python_representation_of_json_data_for_a_publication_known_to_have_related_superseding_or_preceding_publications(step):
    world.sim3069_pubdata = {'seriesNumber': '3069', 'projection': 'Universal Transverse Mercator', 'links': [{'url': 'http://pubs.usgs.gov/sim/3069/', 'linkFileType': {'text': 'html', 'id': 5}, 'type': {'text': 'Index Page', 'id': 15}, 'id': 103481, 'rank': 100}, {'url': 'http://pubs.er.usgs.gov/thumbnails/usgs_thumb.jpg', 'type': {'text': 'Thumbnail', 'id': 24}, 'id': 5291951, 'rank': 0}], 'indexId': 'sim3069', 'geographicExtents': '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [ [ [ -87.75,37.75 ], [ -87.75,38.1175 ], [ -87.36749999999999,38.1175 ], [ -87.36749999999999,37.75 ], [ -87.75,37.75 ] ] ] } } ] }', 'edition': '-', 'isbn': '9781411324022', 'id': 97554, 'productDescription': 'Report: iv, 20 p.; 2 Map Sheets: 41 x 37.5 inches and 42 x 38.5 inches; Downloads Directory', 'title': 'Surficial Geologic Map of the Evansville, Indiana, and Henderson, Kentucky, Area', 'editors': [], 'seriesTitle': {'onlineIssn': '2329-132X', 'text': 'Scientific Investigations Map', 'id': 333, 'printIssn': '2329-1311'}, 'publisher': 'U.S. Geological Survey', 'lastModifiedDate': '2012-02-10T00:11:55.000', 'collaboration': 'Prepared in cooperation with the Indiana, Kentucky, and Illinois State Geological Surveys', 'costCenters': [{'text': 'Earth Surface Processes Team', 'id': 229}], 'additionalOnlineFiles': 'Y', 'scale': '50000', 'authors': [{'given': 'Emily M.', 'family': 'Taylor', 'text': 'Taylor, Emily M. emtaylor@usgs.gov', 'rank': 9, 'id': 302466, 'affiliation': {'text': 'Geosciences and Environmental Change Science Center', 'id': 318}, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 1240, 'email': 'emtaylor@usgs.gov', 'usgs': True}, {'given': 'Theodore R.', 'family': 'Brandt', 'text': 'Brandt, Theodore R. tbrandt@usgs.gov', 'rank': 11, 'id': 302467, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 1267, 'email': 'tbrandt@usgs.gov', 'usgs': True}, {'given': 'Scott C.', 'family': 'Lundstrom', 'text': 'Lundstrom, Scott C. sclundst@usgs.gov', 'rank': 2, 'id': 302468, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 2446, 'email': 'sclundst@usgs.gov', 'usgs': True}, {'given': 'Ronald C.', 'family': 'Counts', 'text': 'Counts, Ronald C. rcounts@usgs.gov', 'rank': 3, 'id': 302469, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 5343, 'email': 'rcounts@usgs.gov', 'usgs': True}, {'given': 'Michael L.', 'family': 'Murphy', 'text': 'Murphy, Michael L.', 'rank': 7, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 23652, 'id': 302470, 'usgs': True}, {'given': 'Erik P.', 'family': 'Kvale', 'text': 'Kvale, Erik P.', 'rank': 10, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 29090, 'id': 302471, 'usgs': True}, {'given': 'Wayne L.', 'family': 'Newell', 'text': 'Newell, Wayne L.', 'rank': 6, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 48538, 'id': 302472, 'usgs': True}, {'given': 'William M.', 'suffix': 'Jr.', 'family': 'Andrews', 'text': 'Andrews, William M. Jr.', 'rank': 5, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 51406, 'id': 302473, 'usgs': True}, {'given': 'David W.', 'family': 'Moore', 'text': 'Moore, David W.', 'rank': 1, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 63835, 'id': 302474, 'usgs': True}, {'given': 'Mark F.', 'family': 'Thompson', 'text': 'Thompson, Mark F.', 'rank': 8, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 77625, 'id': 302475, 'usgs': True}, {'given': 'Steven L.', 'family': 'Martin', 'text': 'Martin, Steven L.', 'rank': 4, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 78433, 'id': 302476, 'usgs': True}], 'publicationType': {'text': 'Report', 'id': 18}, 'publicationYear': '2009', 'language': 'ENGLISH', 'docAbstract': "The geologic map of the Evansville, Indiana, and Henderson, Kentucky, area depicts and describes surficial deposits according to their origin and age. Unconsolidated alluvium and outwash fill the Ohio River bedrock valley and attain maximum thickness of 33-39 m under Diamond Island, Kentucky, and Griffith Slough, south of Newburgh, Indiana. The fill is chiefly unconsolidated, fine- to medium-grained, lithic quartz sand, interbedded with clay, clayey silt, silt, coarse sand, granules, and gravel. Generally, the valley fill fines upward from the buried bedrock surface: a lower part being gravelly sand to sandy gravel, a middle part mostly of sand, and a surficial veneer of silt and clay interspersed with sandy, natural levee deposits at river's edge. Beneath the unconsolidated fill are buried and discontinuous, lesser amounts of consolidated fill unconformably overlying the buried bedrock surface.\r\n\r\nMost of the glaciofluvial valley fill accumulated during the Wisconsin Episode (late Pleistocene). Other units depicted on the map include creek alluvium, slackwater lake (lacustrine) deposits, colluvium, dune sand, loess, and sparse bedrock outcrops. Creek alluvium underlies creek floodplains and consists of silt, clayey silt, and subordinate interbedded fine sand, granules, and pebbles. Lenses and beds of clay are present locally. Silty and clayey slackwater lake (lacustrine) deposits extensively underlie broad flats northeast of Evansville and around Henderson and are as thick as 28 m. Fossil wood collected from an auger hole in the lake and alluvial deposits of Little Creek, at depths of 10.6 m and 6.4 m, are dated 16,650+-50 and 11,120+-40 radiocarbon years, respectively. Fossil wood collected from lake sediment 16 m below the surface in lake sediment was dated 33,100+-590 radiocarbon years.\r\n\r\nCovering the hilly bedrock upland is loess (Qel), 3-7.5 m thick in Indiana and 9-15 m thick in Kentucky, deposited about 22,000-12,000 years before present. Most mapped surficial deposits in the quadrangle are probably no older than about 55,000 years. Lithologic logs, shear-wave velocities, and other cone penetrometer data are used to interpret depositional environments and geologic history of the surficial deposits.\r\n\r\nThis map, which includes an area of slightly more than seven 7.5-minute quadrangles, serves several purposes. It is a tool for assessing seismic and flood hazards of a major urban area; aids urban planning; conveys geologic history; and locates aggregate resources. The map was produced concurrently with research by seismologists to determine places where the surficial deposits may tend to liquefy and (or) to amplify ground motions during strong earthquakes. Such hazardous responses to shaking are related to the characteristics of the geologic materials and topographic position, which the geologic map depicts. The geologic map is an element in the cooperative seismic hazard assessment program among the States of Indiana, Kentucky, and Illinois and the U.S. Geological Survey, funded by the National Earthquake Hazards Reduction Program and National Cooperative Geologic Mapping Program of the U.S. Geological Survey.", 'displayToPublicDate': '2009-05-22T00:00:00.000', 'publicationSubtype': {'text': 'USGS Numbered Series', 'id': 5}, 'usgsCitation': 'Surficial Geologic Map of the Evansville, Indiana, and Henderson, Kentucky, Area; 2009; SIM; 3069; Moore, David W.; Lundstrom, Scott C.; Counts, Ronald C.; Martin, Steven L.; Andrews, William M., Jr.; Newell, Wayne L.; Murphy, Michael L.; Thompson, Mark F.; Taylor, Emily M.; Kvale, Erik P.; Brandt, Theodore R.'}
    world.supersede_url_root = 'http://pubs.er.usgs.gov'


@step(r'I pass those store variables to add_relationships_graphs')
def add_supersede_pubs(step):
    world.sim3069_pubdata_with_offers = add_relationships_graphs(world.sim3069_pubdata,
                                                                 world.legacy_supersedes_url_base,
                                                                 'http://pubs.er.usgs.gov/')
    httpretty.reset()
    httpretty.disable()

    # new record with relationships in it
    world.expected_sim3069_data_with_offers = {'seriesNumber': '3069', 'projection': 'Universal Transverse Mercator', 'links': [{'url': 'http://pubs.usgs.gov/sim/3069/', 'linkFileType': {'text': 'html', 'id': 5}, 'type': {'text': 'Index Page', 'id': 15}, 'id': 103481, 'rank': 100}, {'url': 'http://pubs.er.usgs.gov/thumbnails/usgs_thumb.jpg', 'type': {'text': 'Thumbnail', 'id': 24}, 'id': 5291951, 'rank': 0}], 'indexId': 'sim3069', 'geographicExtents': '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [ [ [ -87.75,37.75 ], [ -87.75,38.1175 ], [ -87.36749999999999,38.1175 ], [ -87.36749999999999,37.75 ], [ -87.75,37.75 ] ] ] } } ] }', 'edition': '-', 'isbn': '9781411324022', 'id': 97554, 'productDescription': 'Report: iv, 20 p.; 2 Map Sheets: 41 x 37.5 inches and 42 x 38.5 inches; Downloads Directory', 'title': 'Surficial Geologic Map of the Evansville, Indiana, and Henderson, Kentucky, Area', 'editors': [], 'offers': {'@context': {'schema': 'http://schema.org/'}, '@type': 'schema:ScholarlyArticle', 'schema:offers': {'schema:seller': {'schema:name': 'USGS Store', '@type': 'schema:Organization', 'schema:url': 'http://store.usgs.gov'}, 'schema:url': 'http://store.usgs.gov/pubsordernow.jsp?~theme=gp&OSTORE=USGSGP&~OKCODE=STARTMATL&g_matnr=210862', 'schema:price': '16', 'schema:availability': 'schema:InStock', 'schema:priceCurrency': 'USD', '@type': 'schema:Offer'}}, 'seriesTitle': {'onlineIssn': '2329-132X', 'text': 'Scientific Investigations Map', 'id': 333, 'printIssn': '2329-1311'}, 'publisher': 'U.S. Geological Survey', 'lastModifiedDate': '2012-02-10T00:11:55.000', 'collaboration': 'Prepared in cooperation with the Indiana, Kentucky, and Illinois State Geological Surveys', 'costCenters': [{'text': 'Earth Surface Processes Team', 'id': 229}], 'additionalOnlineFiles': 'Y', 'scale': '50000', 'authors': [{'given': 'Emily M.', 'family': 'Taylor', 'text': 'Taylor, Emily M. emtaylor@usgs.gov', 'rank': 9, 'id': 302466, 'affiliation': {'text': 'Geosciences and Environmental Change Science Center', 'id': 318}, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 1240, 'email': 'emtaylor@usgs.gov', 'usgs': True}, {'given': 'Theodore R.', 'family': 'Brandt', 'text': 'Brandt, Theodore R. tbrandt@usgs.gov', 'rank': 11, 'id': 302467, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 1267, 'email': 'tbrandt@usgs.gov', 'usgs': True}, {'given': 'Scott C.', 'family': 'Lundstrom', 'text': 'Lundstrom, Scott C. sclundst@usgs.gov', 'rank': 2, 'id': 302468, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 2446, 'email': 'sclundst@usgs.gov', 'usgs': True}, {'given': 'Ronald C.', 'family': 'Counts', 'text': 'Counts, Ronald C. rcounts@usgs.gov', 'rank': 3, 'id': 302469, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 5343, 'email': 'rcounts@usgs.gov', 'usgs': True}, {'given': 'Michael L.', 'family': 'Murphy', 'text': 'Murphy, Michael L.', 'rank': 7, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 23652, 'id': 302470, 'usgs': True}, {'given': 'Erik P.', 'family': 'Kvale', 'text': 'Kvale, Erik P.', 'rank': 10, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 29090, 'id': 302471, 'usgs': True}, {'given': 'Wayne L.', 'family': 'Newell', 'text': 'Newell, Wayne L.', 'rank': 6, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 48538, 'id': 302472, 'usgs': True}, {'given': 'William M.', 'suffix': 'Jr.', 'family': 'Andrews', 'text': 'Andrews, William M. Jr.', 'rank': 5, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 51406, 'id': 302473, 'usgs': True}, {'given': 'David W.', 'family': 'Moore', 'text': 'Moore, David W.', 'rank': 1, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 63835, 'id': 302474, 'usgs': True}, {'given': 'Mark F.', 'family': 'Thompson', 'text': 'Thompson, Mark F.', 'rank': 8, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 77625, 'id': 302475, 'usgs': True}, {'given': 'Steven L.', 'family': 'Martin', 'text': 'Martin, Steven L.', 'rank': 4, 'contributorType': {'text': 'Authors', 'id': 1}, 'corporation': False, 'contributorId': 78433, 'id': 302476, 'usgs': True}], 'publicationType': {'text': 'Report', 'id': 18}, 'publicationYear': '2009', 'language': 'ENGLISH', 'docAbstract': "The geologic map of the Evansville, Indiana, and Henderson, Kentucky, area depicts and describes surficial deposits according to their origin and age. Unconsolidated alluvium and outwash fill the Ohio River bedrock valley and attain maximum thickness of 33-39 m under Diamond Island, Kentucky, and Griffith Slough, south of Newburgh, Indiana. The fill is chiefly unconsolidated, fine- to medium-grained, lithic quartz sand, interbedded with clay, clayey silt, silt, coarse sand, granules, and gravel. Generally, the valley fill fines upward from the buried bedrock surface: a lower part being gravelly sand to sandy gravel, a middle part mostly of sand, and a surficial veneer of silt and clay interspersed with sandy, natural levee deposits at river's edge. Beneath the unconsolidated fill are buried and discontinuous, lesser amounts of consolidated fill unconformably overlying the buried bedrock surface.\r\n\r\nMost of the glaciofluvial valley fill accumulated during the Wisconsin Episode (late Pleistocene). Other units depicted on the map include creek alluvium, slackwater lake (lacustrine) deposits, colluvium, dune sand, loess, and sparse bedrock outcrops. Creek alluvium underlies creek floodplains and consists of silt, clayey silt, and subordinate interbedded fine sand, granules, and pebbles. Lenses and beds of clay are present locally. Silty and clayey slackwater lake (lacustrine) deposits extensively underlie broad flats northeast of Evansville and around Henderson and are as thick as 28 m. Fossil wood collected from an auger hole in the lake and alluvial deposits of Little Creek, at depths of 10.6 m and 6.4 m, are dated 16,650+-50 and 11,120+-40 radiocarbon years, respectively. Fossil wood collected from lake sediment 16 m below the surface in lake sediment was dated 33,100+-590 radiocarbon years.\r\n\r\nCovering the hilly bedrock upland is loess (Qel), 3-7.5 m thick in Indiana and 9-15 m thick in Kentucky, deposited about 22,000-12,000 years before present. Most mapped surficial deposits in the quadrangle are probably no older than about 55,000 years. Lithologic logs, shear-wave velocities, and other cone penetrometer data are used to interpret depositional environments and geologic history of the surficial deposits.\r\n\r\nThis map, which includes an area of slightly more than seven 7.5-minute quadrangles, serves several purposes. It is a tool for assessing seismic and flood hazards of a major urban area; aids urban planning; conveys geologic history; and locates aggregate resources. The map was produced concurrently with research by seismologists to determine places where the surficial deposits may tend to liquefy and (or) to amplify ground motions during strong earthquakes. Such hazardous responses to shaking are related to the characteristics of the geologic materials and topographic position, which the geologic map depicts. The geologic map is an element in the cooperative seismic hazard assessment program among the States of Indiana, Kentucky, and Illinois and the U.S. Geological Survey, funded by the National Earthquake Hazards Reduction Program and National Cooperative Geologic Mapping Program of the U.S. Geological Survey.", 'displayToPublicDate': '2009-05-22T00:00:00.000', 'publicationSubtype': {'text': 'USGS Numbered Series', 'id': 5}, 'usgsCitation': 'Surficial Geologic Map of the Evansville, Indiana, and Henderson, Kentucky, Area; 2009; SIM; 3069; Moore, David W.; Lundstrom, Scott C.; Counts, Ronald C.; Martin, Steven L.; Andrews, William M., Jr.; Newell, Wayne L.; Murphy, Michael L.; Thompson, Mark F.; Taylor, Emily M.; Kvale, Erik P.; Brandt, Theodore R.'}


@step(r'The offers portion of the pub record should contain what I expect')
def test_relationship_output(step):
    assert_equal(world.sim3069_pubdata_with_offers["offers"], world.expected_sim3069_data_with_offers["offers"])


#
# test author list scenarios
#

@step(r'we have imitated the authors data we would see from pubs')
def make_lists(step):
    world.authors = {
        'authors': [
            {'given': 'apple', 'family': 'orange', 'rank': 1, 'corporation': False},
            {'given': 'mango', 'family': 'grape', 'rank': 2, 'corporation': False}
        ]
    }
    world.organization = {'authors': [{'corporation': True, 'organization': 'A Local Government Agency', 'rank': 1},
                                      {'corporation': True, 'organization': 'Another Local Agency', 'rank': 2}]}
    world.mixed = {'authors': [{'given': 'apple', 'family': 'orange', 'rank': 1, 'corporation': False},
                               {'corporation': True, 'organization': 'A Local Government Agency', 'rank': 2},
                               {'given': 'mango', 'family': 'grape', 'rank': 2, 'corporation': False}]}


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


#
# search publications scenarios
#

@step(r'we have created a fake url and mocked pubs responses')
def imitation_pubs(step):
    world.search_url = 'https://pubs-fake.er.usgs.gov/pubs-services/publication/'
    resp_data = {
        'pageNumber': None,
        'pageRowStart': '0',
        'pageSize': '1',
        'recordCount': 1776,
        'records': [{
            'collaboration': 'A product of the Water Use and Availability Science Program',
            'contact': '<p>Chief, Caribbean-Florida Water Science Center-Florida<br>U.S. Geological Survey<br>4446 Pet Lane,&nbsp;Suite 108<br>Lutz, FL 33559\u20136302<br></p><p><a href="http://fl.water.usgs.gov/" data-mce-href="http://fl.water.usgs.gov/">http://fl.water.usgs.gov/</a></p>',
            'contributors': {
                'authors': [{
                    'affiliations': [{
                        'active': True,
                        'id': 509,
                        'text': 'Office of the AD Water',
                        'usgs': True
                    }],
                    'contributorId': 932,
                    'contributorType': {
                        'id': 1,
                        'text': 'Authors'
                    },
                    'corporation': False,
                    'email': 'elkunian@usgs.gov',
                    'family': 'Kuniansky',
                    'given': 'Eve L.',
                    'id': 645552,
                    'rank': 1,
                    'text': 'Kuniansky, Eve L. elkunian@usgs.gov',
                    'usgs': True
                }]
            },
            'costCenters': [{
                'active': True,
                'id': 509,
                'text': 'Office of the AD Water',
                'usgs': True
            }],
            'country': 'United States',
            'displayToPublicDate': '2016-09-22T00:00:00',
            'docAbstract': '<p>Understanding karst aquifers, for purposes of their management and protection, poses unique challenges. Karst aquifers are characterized by groundwater flow through conduits (tertiary porosity), and (or) layers with interconnected pores (secondary porosity) and through intergranular porosity (primary or matrix porosity). Since the late 1960s, advances have been made in the development of numerical computer codes and the use of mathematical model applications towards the understanding of dual (primary [matrix] and secondary [fractures and conduits]) porosity groundwater flow processes, as well as characterization and management of karst aquifers. The Floridan aquifer system (FAS) in Florida and parts of Alabama, Georgia, and South Carolina is composed of a thick sequence of predominantly carbonate rocks. Karst features are present over much of its area, especially in Florida where more than 30 first-magnitude springs occur, numerous sinkholes and submerged conduits have been mapped, and numerous circular lakes within sinkhole depressions are present. Different types of mathematical models have been applied for simulation of the FAS. Most of these models are distributed parameter models based on the assumption that, like a sponge, water flows through connected pores within the aquifer system and can be simulated with the same mathematical methods applied to flow through sand and gravel aquifers; these models are usually referred to as porous-equivalent media models. The partial differential equation solved for groundwater flow is the potential flow equation of fluid mechanics, which is used when flow is dominated by potential energy and has been applied for many fluid problems in which kinetic energy terms are dropped from the differential equation solved. In many groundwater model codes (basic MODFLOW), it is assumed that the water has a constant temperature and density and that flow is laminar, such that kinetic energy has minimal impact on flow. Some models have been developed that incorporate the submerged conduits as a one-dimensional pipe network within the aquifer rather than as discrete, extremely transmissive features in a porous-equivalent medium; these submerged conduit models are usually referred to as hybrid models and may include the capability to simulate both laminar and turbulent flow in the one-dimensional pipe network. Comparisons of the application of a porous-equivalent media model with and without turbulence (MODFLOW-Conduit Flow Process mode 2 and basic MODFLOW, respectively) and a hybrid (MODFLOW-Conduit Flow Process mode 1) model to the Woodville Karst Plain near Tallahassee, Florida, indicated that for annual, monthly, or seasonal average hydrologic conditions, all methods met calibration criteria (matched observed groundwater levels and average flows). Thus, the increased effort required, such as the collection of data on conduit location, to develop a hybrid model and its increased computational burden, is not necessary for simulation of average hydrologic conditions (non-laminar flow effects on simulated head and spring discharge were minimal). However, simulation of a large storm event in the Woodville Karst Plain with daily stress periods indicated that turbulence is important for matching daily springflow hydrographs. Thus, if matching streamflow hydrographs over a storm event is required, the simulation of non-laminar flow and the location of conduits are required. The main challenge in application of the methods and approaches for developing hybrid models relates to the difficulty of mapping conduit networks or having high-quality datasets to calibrate these models. Additionally, hybrid models have long simulation times, which can preclude the use of parameter estimation for calibration. Simulation of contaminant transport that does not account for preferential flow through conduits or extremely permeable zones in any approach is ill-advised. Simulation results in other karst aquifers or other parts of the FAS may differ from the comparison demonstrated herein.</p>',
            'doi': '10.3133/sir20165116',
            'geographicExtents': '{\n  "type": "FeatureCollection",\n  "features": [\n    {\n      "type": "Feature",\n      "properties": {},\n      "geometry": {\n        "type": "Polygon",\n        "coordinates": [\n          [\n            [\n              -84.4903564453125,\n              30.04532159026885\n            ],\n            [\n              -84.4903564453125,\n              30.456368670179007\n            ],\n            [\n              -84.06875610351562,\n              30.456368670179007\n            ],\n            [\n              -84.06875610351562,\n              30.04532159026885\n            ],\n            [\n              -84.4903564453125,\n              30.04532159026885\n            ]\n          ]\n        ]\n      }\n    }\n  ]\n}',
            'id': 70175519,
            'indexId': 'sir20165116',
            'interactions': [],
            'ipdsId': 'IP-071317',
            'language': 'English',
            'lastModifiedDate': '2016-09-22T15:54:17',
            'links': [{
                'description': 'SIR 2016\u20135116',
                'id': 328727,
                'linkFileType': {'id': 1, 'text': 'pdf'},
                'rank': 2,
                'size': '3.56 MB',
                'text': 'Report',
                'type': {'id': 11, 'text': 'Document'},
                'url': 'http://pubs.usgs.gov/sir/2016/5116/sir20165116.pdf'
            }, {
                'description': 'SIR 2016\u20135116 Data Release',
                'id': 328833,
                'rank': 3,
                'text': 'USGS data release - MODFLOW and MODFLOW Conduit Flow Process data sets for simulation experiments of the Woodville Karst Plain, near Tallahassee, Florida with three different approaches and different stress periods',
                'type': {'id': 30, 'text': 'Data Release'},
                'url': 'http://dx.doi.org/10.5066/F7PK0D87'
            }, {
                'id': 328726,
                'rank': 1,
                'type': {'id': 24, 'text': 'Thumbnail'},
                'url': 'http://pubs.usgs.gov/sir/2016/5116/coverthb.jpg'
            }],
            'noYear': False,
            'onlineOnly': 'Y',
            'otherGeospatial': 'Woodville Karst Plain',
            'productDescription': 'Report: v, 14 p.; Data Release',
            'publicationSubtype': {
                'id': 5,
                'text': 'USGS Numbered Series'
            },
            'publicationType': {'id': 18, 'text': 'Report'},
            'publicationYear': '2016',
            'publishedDate': '2016-09-22',
            'publisher': 'U.S. Geological Survey',
            'publisherLocation': 'Reston, VA',
            'publishingServiceCenter': {'id': 9, 'text': 'Reston PSC'},
            'seriesNumber': '2016-5116',
            'seriesTitle': {
                'active': True,
                'code': 'SIR',
                'id': 334,
                'onlineIssn': '2328-0328',
                'printIssn': '2328-031X',
                'publicationSubtype': {'id': 5},
                'text': 'Scientific Investigations Report'
            },
            'state': 'Florida',
            'tableOfContents': '<ul><li>Acknowledgments<br></li><li>Abstract<br></li><li>Introduction<br></li><li>Distributed Parameter Models<br></li><li>Model Application in the Woodville Karst Plain, Florida\u2014Comparisons of Single-Continuum and Hybrid Models<br></li><li>Discussion<br></li><li>Conclusions<br></li><li>References Cited<br></li></ul>',
            'text': 'sir20165116 - 2016 - Simulating groundwater flow in karst aquifers with distributed parameter models\u2014Comparison of porous-equivalent media and hybrid flow approaches',
            'title': 'Simulating groundwater flow in karst aquifers with distributed parameter models\u2014Comparison of porous-equivalent media and hybrid flow approaches',
            'usgsCitation': 'Kuniansky, E.L., 2016, Simulating groundwater flow in karst aquifers with distributed parameter models\u2014Comparison of porous-equivalent media and hybrid flow approaches: U.S. Geological Survey Scientific Investigations Report 2016\u20135116, 14 p., http://dx.doi.org/10.3133/sir20165116.'
        }]
    }
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
    world.expected_return_content = {
        'pageNumber': None,
        'pageRowStart': '0',
        'pageSize': '1',
        'recordCount': 1776,
        'records': [{
            'authorsList': ['Eve L. Kuniansky'],
            'authorsListTyped': [{
                'email': 'elkunian@usgs.gov',
                'text': 'Eve L. Kuniansky',
                'type': 'person'
            }],
            'collaboration': 'A product of the Water Use and Availability Science Program',
            'contact': '<p>Chief, Caribbean-Florida Water Science Center-Florida<br>U.S. Geological Survey<br>4446 Pet Lane,&nbsp;Suite 108<br>Lutz, FL 33559\u20136302<br></p><p><a href="http://fl.water.usgs.gov/" data-mce-href="http://fl.water.usgs.gov/">http://fl.water.usgs.gov/</a></p>',
            'contributors': {
                'authors': [{
                    'affiliations': [{
                        'active': True,
                        'id': 509,
                        'text': 'Office of the AD Water',
                        'usgs': True
                    }],
                    'contributorId': 932,
                    'contributorType': {
                        'id': 1,
                        'text': 'Authors'
                    },
                    'corporation': False,
                    'email': 'elkunian@usgs.gov',
                    'family': 'Kuniansky',
                    'given': 'Eve L.',
                    'id': 645552,
                    'rank': 1,
                    'text': 'Kuniansky, Eve L. elkunian@usgs.gov',
                    'usgs': True
                }]
            },
            'costCenters': [{
                'active': True,
                'id': 509,
                'text': 'Office of the AD Water',
                'usgs': True
            }],
            'country': 'United States',
            'displayToPublicDate': '2016-09-22T00:00:00',
            'docAbstract': '<p>Understanding karst aquifers, for purposes of their management and protection, poses unique challenges. Karst aquifers are characterized by groundwater flow through conduits (tertiary porosity), and (or) layers with interconnected pores (secondary porosity) and through intergranular porosity (primary or matrix porosity). Since the late 1960s, advances have been made in the development of numerical computer codes and the use of mathematical model applications towards the understanding of dual (primary [matrix] and secondary [fractures and conduits]) porosity groundwater flow processes, as well as characterization and management of karst aquifers. The Floridan aquifer system (FAS) in Florida and parts of Alabama, Georgia, and South Carolina is composed of a thick sequence of predominantly carbonate rocks. Karst features are present over much of its area, especially in Florida where more than 30 first-magnitude springs occur, numerous sinkholes and submerged conduits have been mapped, and numerous circular lakes within sinkhole depressions are present. Different types of mathematical models have been applied for simulation of the FAS. Most of these models are distributed parameter models based on the assumption that, like a sponge, water flows through connected pores within the aquifer system and can be simulated with the same mathematical methods applied to flow through sand and gravel aquifers; these models are usually referred to as porous-equivalent media models. The partial differential equation solved for groundwater flow is the potential flow equation of fluid mechanics, which is used when flow is dominated by potential energy and has been applied for many fluid problems in which kinetic energy terms are dropped from the differential equation solved. In many groundwater model codes (basic MODFLOW), it is assumed that the water has a constant temperature and density and that flow is laminar, such that kinetic energy has minimal impact on flow. Some models have been developed that incorporate the submerged conduits as a one-dimensional pipe network within the aquifer rather than as discrete, extremely transmissive features in a porous-equivalent medium; these submerged conduit models are usually referred to as hybrid models and may include the capability to simulate both laminar and turbulent flow in the one-dimensional pipe network. Comparisons of the application of a porous-equivalent media model with and without turbulence (MODFLOW-Conduit Flow Process mode 2 and basic MODFLOW, respectively) and a hybrid (MODFLOW-Conduit Flow Process mode 1) model to the Woodville Karst Plain near Tallahassee, Florida, indicated that for annual, monthly, or seasonal average hydrologic conditions, all methods met calibration criteria (matched observed groundwater levels and average flows). Thus, the increased effort required, such as the collection of data on conduit location, to develop a hybrid model and its increased computational burden, is not necessary for simulation of average hydrologic conditions (non-laminar flow effects on simulated head and spring discharge were minimal). However, simulation of a large storm event in the Woodville Karst Plain with daily stress periods indicated that turbulence is important for matching daily springflow hydrographs. Thus, if matching streamflow hydrographs over a storm event is required, the simulation of non-laminar flow and the location of conduits are required. The main challenge in application of the methods and approaches for developing hybrid models relates to the difficulty of mapping conduit networks or having high-quality datasets to calibrate these models. Additionally, hybrid models have long simulation times, which can preclude the use of parameter estimation for calibration. Simulation of contaminant transport that does not account for preferential flow through conduits or extremely permeable zones in any approach is ill-advised. Simulation results in other karst aquifers or other parts of the FAS may differ from the comparison demonstrated herein.</p>',
            'doi': '10.3133/sir20165116',
            'geographicExtents': '{\n  "type": "FeatureCollection",\n  "features": [\n    {\n      "type": "Feature",\n      "properties": {},\n      "geometry": {\n        "type": "Polygon",\n        "coordinates": [\n          [\n            [\n              -84.4903564453125,\n              30.04532159026885\n            ],\n            [\n              -84.4903564453125,\n              30.456368670179007\n            ],\n            [\n              -84.06875610351562,\n              30.456368670179007\n            ],\n            [\n              -84.06875610351562,\n              30.04532159026885\n            ],\n            [\n              -84.4903564453125,\n              30.04532159026885\n            ]\n          ]\n        ]\n      }\n    }\n  ]\n}',
            'id': 70175519,
            'indexId': 'sir20165116',
            'interactions': [],
            'ipdsId': 'IP-071317',
            'language': 'English',
            'lastModifiedDate': '2016-09-22T15:54:17',
            'links': [{
                'description': 'SIR 2016\u20135116',
                'id': 328727,
                'linkFileType': {'id': 1, 'text': 'pdf'},
                'rank': 2,
                'size': '3.56 MB',
                'text': 'Report',
                'type': {'id': 11, 'text': 'Document'},
                'url': 'http://pubs.usgs.gov/sir/2016/5116/sir20165116.pdf'
            }, {
                'description': 'SIR 2016\u20135116 Data Release',
                'id': 328833,
                'rank': 3,
                'text': 'USGS data release - MODFLOW and MODFLOW Conduit Flow Process data sets for simulation experiments of the Woodville Karst Plain, near Tallahassee, Florida with three different approaches and different stress periods',
                'type': {'id': 30, 'text': 'Data Release'},
                'url': 'http://dx.doi.org/10.5066/F7PK0D87'
            }, {
                'id': 328726,
                'rank': 1,
                'type': {'id': 24, 'text': 'Thumbnail'},
                'url': 'http://pubs.usgs.gov/sir/2016/5116/coverthb.jpg'
            }],
            'noYear': False,
            'onlineOnly': 'Y',
            'otherGeospatial': 'Woodville Karst Plain',
            'productDescription': 'Report: v, 14 p.; Data Release',
            'publicationSubtype': {'id': 5, 'text': 'USGS Numbered Series'},
            'publicationType': {'id': 18, 'text': 'Report'},
            'publicationYear': '2016',
            'publishedDate': '2016-09-22',
            'publisher': 'U.S. Geological Survey',
            'publisherLocation': 'Reston, VA',
            'publishingServiceCenter': {'id': 9, 'text': 'Reston PSC'},
            'seriesNumber': '2016-5116',
            'seriesTitle': {
                'active': True,
                'code': 'SIR',
                'id': 334,
                'onlineIssn': '2328-0328',
                'printIssn': '2328-031X',
                'publicationSubtype': {'id': 5},
                'text': 'Scientific Investigations Report'
            },
            'state': 'Florida',
            'tableOfContents': '<ul><li>Acknowledgments<br></li><li>Abstract<br></li><li>Introduction<br></li><li>Distributed Parameter Models<br></li><li>Model Application in the Woodville Karst Plain, Florida\u2014Comparisons of Single-Continuum and Hybrid Models<br></li><li>Discussion<br></li><li>Conclusions<br></li><li>References Cited<br></li></ul>',
            'text': 'sir20165116 - 2016 - Simulating groundwater flow in karst aquifers with distributed parameter models\u2014Comparison of porous-equivalent media and hybrid flow approaches',
            'title': 'Simulating groundwater flow in karst aquifers with distributed parameter models\u2014Comparison of porous-equivalent media and hybrid flow approaches',
            'usgsCitation': 'Kuniansky, E.L., 2016, Simulating groundwater flow in karst aquifers with distributed parameter models\u2014Comparison of porous-equivalent media and hybrid flow approaches: U.S. Geological Survey Scientific Investigations Report 2016\u20135116, 14 p., http://dx.doi.org/10.3133/sir20165116.'
        }]
    }
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
                           status=503)


@step(r'I search through the failed service')
def search_nothing(step):
    test_params = {'q': 'some_state'}
    world.response = SearchPublications(world.search_url).get_pubs_search_results(test_params)
    world.expected_return_content = None
    world.expected_status_code = 503


#
# sort list of dictionaries scenario
#

@step(r'I have a list of dictionaries')
def setup_list(step):
    world.test_list = [{'year': '2013', 'title': 'Napoleonic Wars 1810 - 1815'},
                       {'year': '2010', 'title': 'Napoleanic Wars 1803 - 1810'}]


@step(r'I provide the list and a valid key name')
def perform_sorting(step):
    world.result = sort_list_of_dicts(world.test_list, key_name='year')


@step(r'I see a list sorted by the specified key')
def check_sort_results(step):
    world.expected_first_item = {'year': '2010', 'title': 'Napoleanic Wars 1803 - 1810'}
    actual_first_item = world.result[0]
    assert_equal(world.expected_first_item, actual_first_item)


#
# Parse superseding information scenario
#

@step(r'I have mocked some publication JSON')
def mock_supersedes(step):
    world.mock_supersedes = {'seriesNumber': '071-99', 'links': [{'url': 'http://pubs.usgs.gov/fs/1999/0071/report.pdf', 'rank': 300, 'type': {'text': 'Document', 'id': 11}, 'id': 5107809, 'linkFileType': {'text': 'pdf', 'id': 1}}, {'url': 'http://pubs.usgs.gov/fs/1999/0071/report-thumb.jpg', 'type': {'text': 'Thumbnail', 'id': 24}, 'id': 5231293, 'rank': 0}], 'edition': '-', 'authorsList': ['U.S. Geological Survey'], 'displayLinks': {'Project Site': [], 'Application Site': [], 'Raw Data': [], 'Document': [{'url': 'http://pubs.usgs.gov/fs/1999/0071/report.pdf', 'rank': 300, 'type': {'text': 'Document', 'id': 11}, 'id': 5107809, 'linkFileType': {'text': 'pdf', 'id': 1}}], 'Thumbnail': [{'url': 'http://pubs.usgs.gov/fs/1999/0071/report-thumb.jpg', 'type': {'text': 'Thumbnail', 'id': 24}, 'id': 5231293, 'rank': 0}], 'Metadata': [], 'Plate': [], 'Spatial Data': [], 'Companion Files': [], 'Illustration': [], 'Appendix': [], 'Index Page': [], 'Chapter': [], 'Read Me': [], 'Version History': [], 'Database': [], 'Cover': [], 'Authors Website': [], 'Errata': [], 'Additional Report Piece': [], 'Related Work': [], 'Abstract': [], 'Referenced Work': [], 'Digital Object Identifier': [], 'Image': []}, 'pubHasNoLinks': False, 'id': 5329, 'relationships': {'@context': {'rdac': 'http://rdaregistry.info/Elements/c/', 'rdaw:replacedByWork': {'@type': '@id'}, 'rdaw': 'http://rdaregistry.info/Elements/w/', 'dc': 'http://purl.org/dc/elements/1.1/', 'rdaw:replacementOfWork': {'@type': '@id'}, 'xsd': 'http://www.w3.org/2001/XMLSchema#'}, '@graph': [{'dc:date': '1999', 'dc:title': 'U.S. Geological Survey World Wide Web Information', '@id': 'http://pubs-fake.er.usgs.gov/publication/rj17u', '@type': 'rdac:Work'}, {'dc:date': '1997', 'dc:title': 'U.S. Geological Survey World Wide Web information', '@id': 'http://pubs-fake.er.usgs.gov/publication/fs12196', '@type': 'rdac:Work', 'rdaw:replacedByWork': 'http://pubs-fake.er.usgs.gov/publication/rj17u'}, {'dc:date': '1997', 'dc:title': 'U.S. Geological Survey World Wide Web information', '@id': 'http://pubs-fake.er.usgs.gov/publication/fs12196', '@type': 'rdac:Work', 'rdaw:replacedByWork': 'http://pubs-fake.er.usgs.gov/publication/rj17u'}, {'dc:date': '2000', 'rdaw:replacementOfWork': 'http://pubs-fake.er.usgs.gov/publication/rj17u', 'dc:title': 'U.S. Geological Survey World Wide Web Information', '@id': 'http://pubs-fake.er.usgs.gov/publication/fs03700', '@type': 'rdac:Work'}, {'dc:date': '2001', 'rdaw:replacementOfWork': 'http://pubs-fake.er.usgs.gov/publication/rj17u', 'dc:title': 'U.S. Geological Survey World Wide Web Information', '@id': 'http://pubs-fake.er.usgs.gov/publication/fs03301', '@type': 'rdac:Work'}, {'dc:date': '2003', 'rdaw:replacementOfWork': 'http://pubs-fake.er.usgs.gov/publication/rj17u', 'dc:title': 'U.S. Geological Survey World Wide Web Information', '@id': 'http://pubs-fake.er.usgs.gov/publication/fs05503', '@type': 'rdac:Work'}]}, 'productDescription': '2 p.', 'publisherLocation': 'Reston, VA', 'contributors': {'authors': [{'corporation': True, 'rank': 1, 'contributorType': {'text': 'Authors', 'id': 1}, 'organization': 'U.S. Geological Survey', 'contributorId': 128075, 'text': 'U.S. Geological Survey', 'id': 528496, 'usgs': False}]}, 'docAbstract': 'The U.S. Geological Survey (USGS) invites you to explore an earth science virtual library of digital information, publications, and data. The USGS Internet World Wide Web sites offer an array of information that reflects scientific research and monitoring programs conducted in the areas of natural hazards, environmental resources, and cartography. This list provides gateways to access a cross section of the digital information on the USGS World Wide Web sites.', 'details': [{'Publication type:': 'Report'}, {'Publication Subtype:': 'USGS Numbered Series'}, {'Title:': 'U.S. Geological Survey World Wide Web Information'}, {'Series title:': 'Fact Sheet'}, {'Series number:': '071-99'}, {'Edition:': '-'}, {'Year Published:': '1999'}, {'Language:': 'ENGLISH'}, {'Publisher:': 'U.S.Geological Survey'}, {'Publisher location:': 'Reston, VA'}, {'Contributing office(s):': 'U.S. Geological Survey'}, {'Description:': '2 p.'}], 'lastModifiedDate': '2012-03-16T17:16:05.000', 'seriesTitle': {'onlineIssn': '2327-6932', 'text': 'Fact Sheet', 'id': 313, 'printIssn': '2327-6916'}, 'publicationType': {'text': 'Report', 'id': 18}, 'costCenters': [{'text': 'U.S. Geological Survey', 'id': 595}], 'indexId': 'rj17u', 'formattedModifiedDateTime': 'March 16, 2012 17:16:05', 'publisher': 'U.S.Geological Survey', 'publicationYear': '1999', 'language': 'ENGLISH', 'title': 'U.S. Geological Survey World Wide Web Information', 'displayToPublicDate': '1994-01-01T00:00:00.000', 'publicationSubtype': {'text': 'USGS Numbered Series', 'id': 5}, 'authorsListTyped': [{'text': 'U.S. Geological Survey', 'type': 'corporation'}], 'usgsCitation': 'U.S. Geological Survey World Wide Web Information; 1999; FS; 071-99; Geological Survey (U.S.)'}


@step(r'I pass the JSON to extract_related_pub_info')
def execute_supersedes_parsing(step):
    world.parse_result = extract_related_pub_info(world.mock_supersedes)


@step(r'I see a dictionary containing the preceding and superseding publications')
def check_supersedes_parsing(step):
    expected = {'precede_info': [{'year': '1997', 'id': 'fs12196', 'title': 'U.S. Geological Survey World Wide Web information'}, {'year': '1997', 'id': 'fs12196', 'title': 'U.S. Geological Survey World Wide Web information'}], 'supersede_info': [{'year': '2000', 'id': 'fs03700', 'title': 'U.S. Geological Survey World Wide Web Information'}, {'year': '2001', 'id': 'fs03301', 'title': 'U.S. Geological Survey World Wide Web Information'}, {'year': '2003', 'id': 'fs05503', 'title': 'U.S. Geological Survey World Wide Web Information'}], 'precede_len': 2, 'supersede_len': 3}
    assert_equal(expected, world.parse_result)


#
# Munging abstract scenario
#

@step("There is an publication record with a docAbstract that contains an H1 tag")
def abstact_with_h1(step):
    """
    :type step lettuce.core.Step
    """
    world.mock_pubs_with_h1 = {
        'additionalOnlineFiles': 'N',
        'contact': '<p>Director, National Climate Change and Wildlife Science Center<br /> U.S. Geological Survey<br /> MS 516 National Center<br /> 12201 Sunrise Valley Drive <br />Reston, VA 20192<br /> <a href="https://nccwsc.usgs.gov/">https://nccwsc.usgs.gov/ </a></p>',
        'contributors': {
            'authors': [{
                'affiliation': {
                    'id': 411,
                    'text': 'National Climate Change and Wildlife Science Center'
                },
                'contributorId': 131090,
                'contributorType': {
                    'id': 1,
                    'text': 'Authors'
                },
                'corporation': False,
                'email': 'evarela-acevedo@usgs.gov',
                'family': 'Varela Minder',
                'given': 'Elda',
                'id': 568180,
                'rank': 1,
                'text': 'Varela Minder, Elda evarela-acevedo@usgs.gov',
                'usgs': True
            }, {
                'contributorId': 97822,
                'contributorType': {
                    'id': 1,
                    'text': 'Authors'
                },
                'corporation': False,
                'family': 'Padgett',
                'given': 'Holly A.',
                'id': 578231,
                'rank': 2,
                'text': 'Padgett, Holly A.',
                'usgs': True
            }]
        },
        'costCenters': [{
            'id': 411,
            'text': 'National Climate Change and Wildlife Science Center'
        }],
        'country': 'United States',
        'displayToPublicDate': '2015-10-27T12:00:00.000',
        'docAbstract': '<h1>Introduction</h1>\n<p>The National Climate Change and Wildlife Science Center (NCCWSC) and the Department of the Interior (DOI) Climate Science Centers (CSCs) had another exciting year in 2014. The NCCWSC moved toward focusing their science funding on several high priority areas and, along with the CSCs, gained new agency partners; contributed to various workshops, meetings, publications, student activities, and Tribal/indigenous activities; increased outreach; and more.&nbsp;</p>',
        'doi': '10.3133/cir1415',
        'geographicExtents': '',
        'id': 70156241,
        'indexId': 'cir1415',
        'interactions': [],
        'ipdsId': 'IP-064590',
        'language': 'English',
        'lastModifiedDate': '2015-10-27T14:20:49.000',
        'links': [{
            'description': 'CIR 1415',
            'id': 310576,
            'linkFileType': {'id': 1, 'text': 'pdf'},
            'rank': 2,
            'size': '4 MB',
            'text': 'Report',
            'type': {
                'id': 11, 'text': 'Document'
            },
            'url': 'http://pubs.usgs.gov/circ/1415/circ1415.pdf'
        }, {
            'id': 310575,
            'rank': 1,
            'type': {'id': 24, 'text': 'Thumbnail'},
            'url': 'http://pubs.usgs.gov/circ/1415/coverthb.jpg'
        }],
        'onlineOnly': 'Y',
        'productDescription': 'v, 18 p.',
        'publicationSubtype': {'id': 5, 'text': 'USGS Numbered Series'},
        'publicationType': {'id': 18, 'text': 'Report'},
        'publicationYear': '2015',
        'publishedDate': '2015-10-27',
        'publisher': 'U.S. Geological Survey',
        'publisherLocation': 'Reston, VA',
        'publishingServiceCenter': {'id': 9, 'text': 'Reston PSC'},
        'seriesNumber': '1415',
        'seriesTitle': {
            'id': 307,
            'onlineIssn': '2330-5703',
            'printIssn': '1067-084X',
            'text': 'Circular'
        },
        'tableOfContents': '<ul>\n<li>Introduction</li>\n<li>Providing Science and Tools to Address the Impacts of Climate Change</li>\n<li>Partnering to Ensure High Quality and Usable Science for All Stakeholders</li>\n<li>New Federal Partners</li>\n<li>Building Relations and Communicating Our Science</li>\n<li>Training the Next Generation of Scientists and Managers</li>\n<li>Strengthening the NCCWSC/CSC Enterprise</li>\n<li>More about the NCCWSC and DOI CSCs</li>\n<li>DOI Climate Science Centers</li>\n</ul>',
        'text': 'cir1415 - 2015 - The National Climate Change and Wildlife Science Center and Department of the Interior Climate Science Centers annual report for 2014',
        'title': 'The National Climate Change and Wildlife Science Center and Department of the Interior Climate Science Centers annual report for 2014',
        'usgsCitation': 'Varela Minder, Elda, and Padgett, Holly A. 2015, The National Climate Change and Wildlife Science Center and Department of the Interior Climate Science Centers annual report for 2014: U.S. Geological Survey Circular 1415, 32 p., http://dx.doi.org/10.3133/cir1415.'
    }


@step("I pass the publication record to munge_abstract")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """
    world.munged_abstract_result = munge_abstract(world.mock_pubs_with_h1)
    world.munged_abstract_result_expected = {
        'abstractHeader': 'Introduction',
        'additionalOnlineFiles': 'N',
        'contact': '<p>Director, National Climate Change and Wildlife Science Center<br /> U.S. Geological Survey<br /> MS 516 National Center<br /> 12201 Sunrise Valley Drive <br />Reston, VA 20192<br /> <a href="https://nccwsc.usgs.gov/">https://nccwsc.usgs.gov/ </a></p>',
        'contributors': {
            'authors': [{
                'affiliation': {
                    'id': 411,
                    'text': 'National Climate Change and Wildlife Science Center'
                },
                'contributorId': 131090,
                'contributorType': {'id': 1, 'text': 'Authors'},
                'corporation': False,
                'email': 'evarela-acevedo@usgs.gov',
                'family': 'Varela Minder',
                'given': 'Elda',
                'id': 568180,
                'rank': 1,
                'text': 'Varela Minder, Elda evarela-acevedo@usgs.gov',
                'usgs': True
            }, {
                'contributorId': 97822,
                'contributorType': {'id': 1, 'text': 'Authors'},
                'corporation': False,
                'family': 'Padgett',
                'given': 'Holly A.',
                'id': 578231,
                'rank': 2,
                'text': 'Padgett, Holly A.',
                'usgs': True
            }]
        },
        'costCenters': [{
            'id': 411,
            'text': 'National Climate Change and Wildlife Science Center'
        }],
        'country': 'United States',
        'displayToPublicDate': '2015-10-27T12:00:00.000',
        'docAbstract': '\n<p>The National Climate Change and Wildlife Science Center (NCCWSC) and the Department of the Interior (DOI) Climate Science Centers (CSCs) had another exciting year in 2014. The NCCWSC moved toward focusing their science funding on several high priority areas and, along with the CSCs, gained new agency partners; contributed to various workshops, meetings, publications, student activities, and Tribal/indigenous activities; increased outreach; and more.\xc2\xa0</p>',
        'doi': '10.3133/cir1415',
        'geographicExtents': '',
        'id': 70156241,
        'indexId': 'cir1415',
        'interactions': [],
        'ipdsId': 'IP-064590',
        'language': 'English',
        'lastModifiedDate': '2015-10-27T14:20:49.000',
        'links': [{
            'description': 'CIR 1415',
            'id': 310576,
            'linkFileType': {'id': 1, 'text': 'pdf'},
            'rank': 2,
            'size': '4 MB',
            'text': 'Report',
            'type': {'id': 11, 'text': 'Document'},
            'url': 'http://pubs.usgs.gov/circ/1415/circ1415.pdf'
        }, {
            'id': 310575,
            'rank': 1,
            'type': {'id': 24, 'text': 'Thumbnail'},
            'url': 'http://pubs.usgs.gov/circ/1415/coverthb.jpg'
        }],
        'onlineOnly': 'Y',
        'productDescription': 'v, 18 p.',
        'publicationSubtype': {'id': 5, 'text': 'USGS Numbered Series'},
        'publicationType': {'id': 18, 'text': 'Report'},
        'publicationYear': '2015',
        'publishedDate': '2015-10-27',
        'publisher': 'U.S. Geological Survey',
        'publisherLocation': 'Reston, VA',
        'publishingServiceCenter': {'id': 9, 'text': 'Reston PSC'},
        'seriesNumber': '1415',
        'seriesTitle': {
            'id': 307,
            'onlineIssn': '2330-5703',
            'printIssn': '1067-084X',
            'text': 'Circular'
        },
        'tableOfContents': '<ul>\n<li>Introduction</li>\n<li>Providing Science and Tools to Address the Impacts of Climate Change</li>\n<li>Partnering to Ensure High Quality and Usable Science for All Stakeholders</li>\n<li>New Federal Partners</li>\n<li>Building Relations and Communicating Our Science</li>\n<li>Training the Next Generation of Scientists and Managers</li>\n<li>Strengthening the NCCWSC/CSC Enterprise</li>\n<li>More about the NCCWSC and DOI CSCs</li>\n<li>DOI Climate Science Centers</li>\n</ul>',
        'text': 'cir1415 - 2015 - The National Climate Change and Wildlife Science Center and Department of the Interior Climate Science Centers annual report for 2014',
        'title': 'The National Climate Change and Wildlife Science Center and Department of the Interior Climate Science Centers annual report for 2014',
        'usgsCitation': 'Varela Minder, Elda, and Padgett, Holly A. 2015, The National Climate Change and Wildlife Science Center and Department of the Interior Climate Science Centers annual report for 2014: U.S. Geological Survey Circular 1415, 32 p., http://dx.doi.org/10.3133/cir1415.'
    }


@step("I see a dictionary containing the abstractHeader data element and no h1 tags in the docAbstract data element")
def step_impl(step):
    """
    :type step lettuce.core.Step

    """
    assert_items_equal(world.munged_abstract_result, world.munged_abstract_result_expected)


@step("I have a mocked base publication record that has a populated interactions data element, a base url, and a mocked legacy endpoint")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """
    world.pub_with_precede_and_supersede = \
        {'additionalOnlineFiles': 'N',
         'contributors': {'authors': [{'contributorId': 128075,
                                         'contributorType': {'id': 1,
                                                              'text': 'Authors'},
                                         'corporation': True,
                                         'id': 528496,
                                         'organization': 'U.S. Geological Survey',
                                         'rank': 1,
                                         'text': 'U.S. Geological Survey',
                                         'usgs': False}]},
         'costCenters': [],
         'displayToPublicDate': '1994-01-01T00:00:00.000',
         'docAbstract': '<p>The U.S. Geological Survey (USGS) invites you to explore an earth science virtual library of digital information, publications, and data. The USGS Internet World Wide Web sites offer an array of information that reflects scientific research and monitoring programs conducted in the areas of natural hazards, environmental resources, and cartography. This list provides gateways to access a cross section of the digital information on the USGS World Wide Web sites.</p>',
         'edition': '-',
         'id': 5329,
         'indexId': 'fs07199',
         'interactions': [{'id': 1,
                            'object': {'id': 5329,
                                        'indexId': 'fs07199',
                                        'publicationYear': '1999',
                                        'text': 'fs07199 - 1999 - U.S. Geological Survey World Wide Web Information',
                                        'title': 'U.S. Geological Survey World Wide Web Information'},
                            'predicate': 'SUPERSEDED_BY',
                            'subject': {'id': 5328,
                                         'indexId': 'fs12196',
                                         'publicationYear': '1997',
                                         'text': 'fs12196 - 1997 - U.S. Geological Survey World Wide Web information',
                                         'title': 'U.S. Geological Survey World Wide Web information'}},
                           {'id': 2,
                            'object': {'id': 53167,
                                        'indexId': 'fs05503',
                                        'publicationYear': '2003',
                                        'text': 'fs05503 - 2003 - U.S. Geological Survey World Wide Web Information',
                                        'title': 'U.S. Geological Survey World Wide Web Information'},
                            'predicate': 'SUPERSEDED_BY',
                            'subject': {'id': 5329,
                                         'indexId': 'fs07199',
                                         'publicationYear': '1999',
                                         'text': 'fs07199 - 1999 - U.S. Geological Survey World Wide Web Information',
                                         'title': 'U.S. Geological Survey World Wide Web Information'}}],
         'language': 'ENGLISH',
         'lastModifiedDate': '2015-05-19T09:06:22.000',
         'links': [{'id': 139664,
                     'rank': 0,
                     'type': {'id': 24, 'text': 'Thumbnail'},
                     'url': 'http://pubs.usgs.gov/fs/1999/0071/report-thumb.jpg'},
                    {'id': 32025,
                     'linkFileType': {'id': 1, 'text': 'pdf'},
                     'rank': 300,
                     'type': {'id': 11, 'text': 'Document'},
                     'url': 'http://pubs.usgs.gov/fs/1999/0071/report.pdf'}],
         'onlineOnly': 'N',
         'productDescription': '2 p.',
         'publicationSubtype': {'id': 5, 'text': 'USGS Numbered Series'},
         'publicationType': {'id': 18, 'text': 'Report'},
         'publicationYear': '1999',
         'publisher': 'U.S.Geological Survey',
         'publisherLocation': 'Reston, VA',
         'seriesNumber': '071-99',
         'seriesTitle': {'id': 313,
                          'onlineIssn': '2327-6932',
                          'printIssn': '2327-6916',
                          'text': 'Fact Sheet'},
         'supersededBy': {'id': 53167,
                           'indexId': 'fs05503',
                           'publicationYear': '2003',
                           'text': 'fs05503 - 2003 - U.S. Geological Survey World Wide Web Information',
                           'title': 'U.S. Geological Survey World Wide Web Information'},
         'text': 'fs07199 - 1999 - U.S. Geological Survey World Wide Web Information',
         'title': 'U.S. Geological Survey World Wide Web Information',
         'usgsCitation': 'U.S. Geological Survey World Wide Web Information; 1999; FS; 071-99; Geological Survey (U.S.)'}
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
        {'additionalOnlineFiles': 'N',
         'contributors': {'authors': [{'contributorId': 128075,
                                         'contributorType': {'id': 1,
                                                              'text': 'Authors'},
                                         'corporation': True,
                                         'id': 528496,
                                         'organization': 'U.S. Geological Survey',
                                         'rank': 1,
                                         'text': 'U.S. Geological Survey',
                                         'usgs': False}]},
         'costCenters': [],
         'displayToPublicDate': '1994-01-01T00:00:00.000',
         'docAbstract': '<p>The U.S. Geological Survey (USGS) invites you to explore an earth science virtual library of digital information, publications, and data. The USGS Internet World Wide Web sites offer an array of information that reflects scientific research and monitoring programs conducted in the areas of natural hazards, environmental resources, and cartography. This list provides gateways to access a cross section of the digital information on the USGS World Wide Web sites.</p>',
         'edition': '-',
         'id': 5329,
         'indexId': 'fs07199',
         'interactions': [{'id': 1,
                            'object': {'id': 5329,
                                        'indexId': 'fs07199',
                                        'publicationYear': '1999',
                                        'text': 'fs07199 - 1999 - U.S. Geological Survey World Wide Web Information',
                                        'title': 'U.S. Geological Survey World Wide Web Information'},
                            'predicate': 'SUPERSEDED_BY',
                            'subject': {'id': 5328,
                                         'indexId': 'fs12196',
                                         'publicationYear': '1997',
                                         'text': 'fs12196 - 1997 - U.S. Geological Survey World Wide Web information',
                                         'title': 'U.S. Geological Survey World Wide Web information'}},
                           {'id': 2,
                            'object': {'id': 53167,
                                        'indexId': 'fs05503',
                                        'publicationYear': '2003',
                                        'text': 'fs05503 - 2003 - U.S. Geological Survey World Wide Web Information',
                                        'title': 'U.S. Geological Survey World Wide Web Information'},
                            'predicate': 'SUPERSEDED_BY',
                            'subject': {'id': 5329,
                                         'indexId': 'fs07199',
                                         'publicationYear': '1999',
                                         'text': 'fs07199 - 1999 - U.S. Geological Survey World Wide Web Information',
                                         'title': 'U.S. Geological Survey World Wide Web Information'}}],
         'language': 'ENGLISH',
         'lastModifiedDate': '2015-05-19T09:06:22.000',
         'links': [{'id': 139664,
                     'rank': 0,
                     'type': {'id': 24, 'text': 'Thumbnail'},
                     'url': 'http://pubs.usgs.gov/fs/1999/0071/report-thumb.jpg'},
                    {'id': 32025,
                     'linkFileType': {'id': 1, 'text': 'pdf'},
                     'rank': 300,
                     'type': {'id': 11, 'text': 'Document'},
                     'url': 'http://pubs.usgs.gov/fs/1999/0071/report.pdf'}],
         'onlineOnly': 'N',
         'productDescription': '2 p.',
         'publicationSubtype': {'id': 5, 'text': 'USGS Numbered Series'},
         'publicationType': {'id': 18, 'text': 'Report'},
         'publicationYear': '1999',
         'publisher': 'U.S.Geological Survey',
         'publisherLocation': 'Reston, VA',
         'relationships': {'@context': {'dc': 'http://purl.org/dc/elements/1.1/',
                                        'rdac': 'http://rdaregistry.info/Elements/c/',
                                        'rdaw': 'http://rdaregistry.info/Elements/w/',
                                        'rdaw:replacedByWork': {'@type': '@id'},
                                        'rdaw:replacementOfWork': {'@type': '@id'},
                                        'xsd': 'http://www.w3.org/2001/XMLSchema#'},
                           '@graph': [{'@id': 'http://127.0.0.1:5050/publication/fs07199',
                                       '@type': 'rdac:Work',
                                       'dc:date': '1999',
                                       'dc:title': 'U.S. Geological Survey World Wide Web Information'},
                                      {'@id': 'http://127.0.0.1:5050/publication/fs12196',
                                       '@type': 'rdac:Work',
                                       'dc:date': '1997',
                                       'dc:title': 'U.S. Geological Survey World Wide Web information',
                                       'rdaw:replacedByWork': 'http://127.0.0.1:5050/publication/fs07199'},
                                      {'@id': 'http://127.0.0.1:5050/publication/fs05503',
                                       '@type': 'rdac:Work',
                                       'dc:date': '2003',
                                       'dc:title': 'U.S. Geological Survey World Wide Web Information',
                                       'rdaw:replacementOfWork': 'http://127.0.0.1:5050/publication/fs07199'}]},
         'seriesNumber': '071-99',
         'seriesTitle': {'id': 313,
                          'onlineIssn': '2327-6932',
                          'printIssn': '2327-6916',
                          'text': 'Fact Sheet'},
         'supersededBy': {'id': 53167,
                           'indexId': 'fs05503',
                           'publicationYear': '2003',
                           'text': 'fs05503 - 2003 - U.S. Geological Survey World Wide Web Information',
                           'title': 'U.S. Geological Survey World Wide Web Information'},
         'text': 'fs07199 - 1999 - U.S. Geological Survey World Wide Web Information',
         'title': 'U.S. Geological Survey World Wide Web Information',
         'usgsCitation': 'U.S. Geological Survey World Wide Web Information; 1999; FS; 071-99; Geological Survey (U.S.)'}

    assert_equal(world.superseded_publication_record_with_graph, expected_record)
