from pubs_ui.pubswh.utils import manipulate_doi_information, generate_sb_data
from pubs_ui import app
import unittest
unittest.TestCase.maxDiff = None

class ManipulateDoiInformationTestCase(unittest.TestCase):
    """Tests for create_display_links"""

    def test_will_doi_link_be_generated_from_doi(self):
        """given a DOI, will an index link be generated?"""
        simple_pubsdata = {
            'publicationSubtype': {
                'text': u'Journal Article'
            },
            'doi': '10.65165468/asdflasdfnlasdkf',
            'links': []
        }
        expected_pubsdata = {
            'publicationSubtype': {
                'text': 'Journal Article'
            },
            'doi': '10.65165468/asdflasdfnlasdkf',
            'links': [
                {
                    "rank": None,
                    "text": "Publisher Index Page (via DOI)",
                    "type": {
                        "id": 15,
                        "text": "Index Page"
                    },
                    "url": "http://dx.doi.org/10.65165468/asdflasdfnlasdkf"
                }
            ]
        }
        assert manipulate_doi_information(simple_pubsdata) == expected_pubsdata

    def test_will_doi_link_and_chorus_be_generated_from_doi(self):
        """given a DOI, will an index link be generated?
        """
        chorus_pubsdata = {
            'publicationSubtype': {
                'text': 'Journal Article'
            },
            "chorus": {
                "auditedOn": "7/27/2015",
                "authors": "Boano F., Harvey J. W., Marion A., Packman A. I., Revelli R., Ridolfi L., Worman A.",
                "journalName": "Reviews of Geophysics",
                "publicationDate": "10/20/2014",
                "publisher": "Wiley-Blackwell",
                "url": "http://dx.doi.org/10.1002/2012rg000417",
                "publiclyAccessibleDate": "10/20/2014"
            },
            "doi": "10.1002/2012RG000417",
            'links': []
        }
        expected_chorus_pubsdata = {
            'chorus': {
                'auditedOn': '7/27/2015',
                'authors': 'Boano F., Harvey J. W., Marion A., Packman A. I., Revelli R., Ridolfi L., Worman A.',
                'journalName': 'Reviews of Geophysics',
                'publicationDate': '10/20/2014',
                'publiclyAccessibleDate': '10/20/2014',
                'publisher': 'Wiley-Blackwell',
                'url': 'http://dx.doi.org/10.1002/2012rg000417'},
            'doi': '10.1002/2012RG000417',
            'links': [{
                       'linkHelpText': 'Publicly accessible after 10/20/2014 (public access data via <a href="http://www.chorusaccess.org" title="link to Chorus.org homepage">CHORUS</a>)',
                       'rank': None,
                       'text': 'Publisher Index Page (via DOI)',
                       'type': {'id': 15, 'text': 'Index Page'},
                       'url': 'http://dx.doi.org/10.1002/2012RG000417'}],
            'publicationSubtype': {'text': 'Journal Article'}}
        assert manipulate_doi_information(chorus_pubsdata) == expected_chorus_pubsdata

    def test_will_missing_link_list_be_generated(self):
        """given a DOI, will an index link be generated even if the links list doesn't exist?"""
        simple_pubsdata = {
            'publicationSubtype': {
                'text': u'Journal Article'
            },
            'doi': '10.65165468/asdflasdfnlasdkf'
        }
        expected_pubsdata = {
            'publicationSubtype': {
                'text': 'Journal Article'
            },
            'doi': '10.65165468/asdflasdfnlasdkf',
            'links': [
                {
                    "rank": None,
                    "text": "Publisher Index Page (via DOI)",
                    "type": {
                        "id": 15,
                        "text": "Index Page"
                    },
                    "url": "http://dx.doi.org/10.65165468/asdflasdfnlasdkf"
                }
            ]
        }
        assert manipulate_doi_information(simple_pubsdata) == expected_pubsdata

    def test_will_an_existing_in_the_link_list_be_maintained(self):
        """given a DOI and a pre-populated links list, will the original link be maintained in the list"""
        simple_pubsdata = {
            'publicationSubtype': {
                'text': u'Journal Article'
            },
            'doi': '10.65165468/asdflasdfnlasdkf',
            'links': [{
                "id": 294043,
                "type": {
                    "id": 24,
                    "text": "Thumbnail"
                    },
                "url": "http://pubs.er.usgs.gov/thumbnails/outside_thumb.jpg"
                }]
        }
        expected_pubsdata = {
            'publicationSubtype': {
                'text': 'Journal Article'
            },
            'doi': '10.65165468/asdflasdfnlasdkf',
            'links': [
                {
                    "id": 294043,
                    "type": {
                        "id": 24,
                        "text": "Thumbnail"
                    },
                    "url": "http://pubs.er.usgs.gov/thumbnails/outside_thumb.jpg"
                },
                {
                    "rank": None,
                    "text": "Publisher Index Page (via DOI)",
                    "type": {
                        "id": 15,
                        "text": "Index Page"
                    },
                    "url": "http://dx.doi.org/10.65165468/asdflasdfnlasdkf"
                }
            ]
        }
        assert manipulate_doi_information(simple_pubsdata) == expected_pubsdata


class GenerateScienceBaseData(unittest.TestCase):
    """Tests for generate_sb_data"""

    replace_pubs_with_pubs_test = False
    supersedes_url = "https://pubs.er.usgs.gov/service/citation/json/extras?"
    json_ld_id_base_url = "https://pubs.er.usgs.gov"

    def test_will_a_basic_sb_record_be_generated_from_a_basic_pubs_record(self):
        """given a basic pubs record, will a decent sciencebase record be generated?"""
        simple_pubsdata = {
            "indexId": "sir20165122",
            "id": 70176077,
            "lastModifiedDate": "2016-09-23T15:22:41",
            "title": "Environmental conditions in the Namskaket Marsh Area, Orleans, Massachusetts",
            "docAbstract": "There is fog and rain and tides and sometomes sun and the tide keeps rising",
            "publicationType": {
                "id": 18,
                "text": "Report"
            },
            "usgsCitation": "A carefully formatted citation with lots of extraneous em and en dashes",
            "scienceBaseUri": "567922a9e4b0da412f4fb509",
            'links': [],
            'interactions': []
        }
        expected_sbdata = {"title": "Environmental conditions in the Namskaket Marsh Area, Orleans, Massachusetts",
             "id": "567922a9e4b0da412f4fb509",
             "identifiers": [
                 {
                    "type": "local-index",
                    "scheme": "unknown",
                    "key": "sir20165122"
                    },
                    {
                    "type": "local-pk",
                    "scheme": "unknown",
                    "key": 70176077
                    }
             ],
             "body":  "There is fog and rain and tides and sometomes sun and the tide keeps rising",
             "citation": "A carefully formatted citation with lots of extraneous em and en dashes",
             "contacts": [],
             "dates": [],
             "tags": [],
             "browseCategories": [
                 "Publication"
             ],
             "browseTypes": [
                 "Citation"
             ],
             'webLinks': [
                 {
                     "type": "webLink",
                     "uri": "http://pubs.er.usgs.gov/publication/sir20165122",
                     "rel": "related",
                     "title": "Publications Warehouse Index Page",
                     "hidden": False
                 }
             ],
             'facets': [{'citationType': 'Report',
                         'className': 'gov.sciencebase.catalog.item.facet.CitationFacet',
                         'conference': None,
                         'edition': None,
                         'journal': None,
                         'language': None,
                         'note': '',
                         'parts': [],
                         'tableOfContents': None}],
             "parentId": app.config['SCIENCEBASE_PARENT_UUID']
             }
        self.assertEqual(generate_sb_data(simple_pubsdata, self.__class__.replace_pubs_with_pubs_test,
                                self.__class__.supersedes_url, self.__class__.json_ld_id_base_url), expected_sbdata)