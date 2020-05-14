"""
Tests for pubswh blueprint's utility functions
"""
import unittest
from unittest.mock import MagicMock, patch

import arrow
import requests as r
import requests_mock

from .test_data import (
    crossref_200_ok, crossref_200_not_ok, crossref_200_ok_2_date_parts,
    crossref_200_ok_1_date_part, crossref_200_ok_message_empty, unpaywall_200_ok, landing_present,
    null_landing)
from ..utils import (
    manipulate_doi_information, generate_sb_data, update_geographic_extents, create_store_info,
    get_altmetric_badge_img_links, SearchPublications, get_crossref_data, check_public_access,
    get_published_online_date, get_unpaywall_data, has_oa_link)
from ... import app


unittest.TestCase.maxDiff = None


class ManipulateDoiInformationTestCase(unittest.TestCase):
    """
    Tests for create_display_links
    """
    # pylint: disable=C0103,R0201,C0301

    def test_will_doi_link_be_generated_from_doi(self):
        """given a DOI, will an index link be generated?"""
        simple_pubsdata = {
            'publicationSubtype': {
                'text': 'Journal Article'
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
                    "url": "https://doi.org/10.65165468/asdflasdfnlasdkf"
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
                'url': 'https://doi.org/10.1002/2012RG000417'
            }],
            'publicationSubtype': {'text': 'Journal Article'}
        }
        assert manipulate_doi_information(chorus_pubsdata) == expected_chorus_pubsdata

    def test_will_missing_link_list_be_generated(self):
        """given a DOI, will an index link be generated even if the links list doesn't exist?"""
        simple_pubsdata = {
            'publicationSubtype': {
                'text': 'Journal Article'
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
                    "url": "https://doi.org/10.65165468/asdflasdfnlasdkf"
                }
            ]
        }
        assert manipulate_doi_information(simple_pubsdata) == expected_pubsdata

    def test_will_an_existing_in_the_link_list_be_maintained(self):
        """given a DOI and a pre-populated links list, will the original link be maintained in the list"""
        simple_pubsdata = {
            'publicationSubtype': {
                'text': 'Journal Article'
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
                    "url": "https://doi.org/10.65165468/asdflasdfnlasdkf"
                }
            ]
        }
        assert manipulate_doi_information(simple_pubsdata) == expected_pubsdata


class GenerateScienceBaseData(unittest.TestCase):
    """
    Tests for generate_sb_data
    """
    # pylint: disable=C0103,R0201,C0301

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
        expected_sbdata = {
            "title": "Environmental conditions in the Namskaket Marsh Area, Orleans, Massachusetts",
            "id": "567922a9e4b0da412f4fb509",
            "identifiers": [{
                "type": "local-index",
                "scheme": "unknown",
                "key": "sir20165122"
            }, {
                "type": "local-pk",
                "scheme": "unknown",
                "key": 70176077
            }],
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
            'webLinks': [{
                "type": "webLink",
                "uri": "http://pubs.er.usgs.gov/publication/sir20165122",
                "rel": "related",
                "title": "Publications Warehouse Index Page",
                "hidden": False
            }],
            'facets': [{
                'citationType': 'Report',
                'className': 'gov.sciencebase.catalog.item.facet.CitationFacet',
                'conference': None,
                'edition': None,
                'journal': None,
                'language': None,
                'note': '',
                'parts': [],
                'tableOfContents': None
            }],
            "parentId": app.config['SCIENCEBASE_PARENT_UUID']
        }
        self.assertEqual(
            generate_sb_data(simple_pubsdata, self.json_ld_id_base_url),
            expected_sbdata
        )


class CreateStoreInfoTestCase(unittest.TestCase):
    # pylint: disable=C0103,R0201,C0301
    def test_store_data_is_created_if_present(self):
        result = create_store_info({'indexId': 'abc091',
                                    'stores': [{'publicationId': 7850,
                                                'store': 'https://fake.store.gov',
                                                'available': True,
                                                'price': 18}]})
        expected = {'offers': {'@context': {'schema': 'http://schema.org/'}, '@type': 'schema:ScholarlyArticle', 'schema:offers': {'schema:seller': {'schema:name': 'USGS Store', '@type': 'schema:Organization', 'schema:url': 'http://store.usgs.gov'}, 'schema:url': 'https://fake.store.gov', 'schema:price': 18, 'schema:availability': 'schema:InStock', 'schema:priceCurrency': 'USD', '@type': 'schema:Offer'}}, 'context_item': 'abc091'}
        self.assertEqual(result, expected)

    def test_store_data_is_listed_as_out_of_stock(self):
        result = create_store_info({'indexId': 'efg845',
                                    'stores': [{'publicationId': 6980,
                                                'store': 'https://fake.store.gov',
                                                'available': False,
                                                'price': 17}]})
        expected = {'offers': {'@context': {'schema': 'http://schema.org/'}, '@type': 'schema:ScholarlyArticle', 'schema:offers': {'schema:seller': {'schema:name': 'USGS Store', '@type': 'schema:Organization', 'schema:url': 'http://store.usgs.gov'}, 'schema:url': 'https://fake.store.gov', 'schema:price': 17, 'schema:availability': 'schema:OutOfStock', 'schema:priceCurrency': 'USD', '@type': 'schema:Offer'}}, 'context_item': 'efg845'}
        self.assertEqual(result, expected)

    def test_store_data_is_created_if_not_present(self):
        result = create_store_info({'indexId': 'xyz735',
                                    'stores': []})
        expected = {'context_item': 'xyz735', 'offers': None}
        self.assertEqual(result, expected)

    def test_store_data_is_created_if_no_store(self):
        result = create_store_info({'indexId': 'mno426'})
        expected = {'context_item': 'mno426', 'offers': None}
        self.assertEqual(result, expected)



class GetAltmetricBadgeImgLinksTestCase(unittest.TestCase):
    # pylint: disable=R0902,C0103
    def setUp(self):
        self.fake_doi = '00.00001/bc.1729'
        self.fake_bad_doi = '00.00001/bc.1729ABC'
        self.fake_endpoint = 'https://fake.api.altmetric.com/v1/'
        self.fake_url = '{0}doi/{1}'.format(self.fake_endpoint, self.fake_doi)
        self.fake_404_url = '{0}doi/{1}'.format(self.fake_endpoint, self.fake_bad_doi)
        self.fake_altmetric_key = 'IfWeCanHitTheBullsEyeTheRestOfTheDominoesWillFallLikeAHouseOfCards.Checkmate!'
        self.verify_cert = False
        self.data_200 = {'images': {'small': 'small_url', 'medium': 'medium_url', 'large': 'large_url'},
                         'details_url': 'https://some_url.fake'}

    @requests_mock.Mocker()
    def test_get_badge_images_from_indexed_doi(self, m):
        m.get(self.fake_url, status_code=200, json=self.data_200)
        result = get_altmetric_badge_img_links(self.fake_doi, self.fake_endpoint,
                                               self.fake_altmetric_key, self.verify_cert)
        expected = (self.data_200['images'], self.data_200['details_url'])
        self.assertTupleEqual(result, expected)

    @requests_mock.Mocker()
    def test_get_badge_images_from_unindexed_doi(self, m):
        m.get(self.fake_404_url, status_code=404)
        result = get_altmetric_badge_img_links(self.fake_bad_doi, self.fake_endpoint,
                                               self.fake_altmetric_key, self.verify_cert)
        expected = (None, None)
        self.assertTupleEqual(result, expected)


class GetCrossrefDataTestCase(unittest.TestCase):
    # pylint: disable=R0902,C0103
    def setUp(self):
        self.fake_doi = '00.00001/bc.1729'
        self.fake_doi_unregistered = '00.00001/bc.1729ABC'
        self.fake_endpoint = 'https://fake.api.crossref.org'
        self.fake_broken_endpoint = 'https://fake.api.croossref.org'
        self.fake_url = '{0}/works/{1}?mailto=pubs_tech_group%40usgs.gov'.format(self.fake_endpoint, self.fake_doi)
        self.fake_url_404 = '{0}/works/{1}?mailto=pubs_tech_group%40usgs.gov'.format(self.fake_endpoint,
                                                                                     self.fake_doi_unregistered)
        self.fake_url_broken = '{0}/works/{1}?mailto=pubs_tech_group%40usgs.gov'.format(self.fake_broken_endpoint,
                                                                                        self.fake_doi)
        self.verify_cert = False
        self.data_200 = crossref_200_ok

    @requests_mock.Mocker()
    def test_get_data_from_indexed_doi(self, m):
        m.get(self.fake_url, status_code=200, json=self.data_200)
        result = get_crossref_data(self.fake_doi, endpoint=self.fake_endpoint, verify=self.verify_cert)
        expected = self.data_200
        self.assertEqual(result, expected)

    @requests_mock.Mocker()
    def test_connection_error(self, m):
        m.get(self.fake_url_broken, exc=r.exceptions.ConnectionError)
        result = get_crossref_data(doi=self.fake_doi, endpoint=self.fake_broken_endpoint, verify=self.verify_cert)
        expected = None
        self.assertEqual(result, expected)

    @requests_mock.Mocker()
    def test_get_data_from_unindexed_doi(self, m):
        m.get(self.fake_url_404, status_code=404)
        result = get_crossref_data(doi=self.fake_doi_unregistered, endpoint=self.fake_endpoint, verify=self.verify_cert)
        expected = None
        self.assertEqual(result, expected)

    def test_doi_is_None(self):
        result = get_crossref_data(None, endpoint=self.fake_endpoint, verify=self.verify_cert)
        expected = None
        self.assertEqual(result, expected)


class GetUnpaywallDataTestCase(unittest.TestCase):
    # pylint: disable=R0902,C0103
    def setUp(self):
        self.fake_doi = '1289018729847'
        self.fake_endpoint = 'https://fake.api.unpaywall.org/v2/'
        self.fake_broken_endpoint = 'https://fake.api.unpaywall.org/v2/1289018729847?email=pubs_tech_group@usgs.gov'
        self.fake_url = '{0}{1}?email=pubs_tech_group@usgs.gov'.format(self.fake_endpoint, self.fake_doi)
        self.data_200 = unpaywall_200_ok
        self.landing_present = landing_present
        self.null_landing = null_landing

    @requests_mock.Mocker()
    def test_get_data_from_indexed_doi(self, m):
        m.get(self.fake_url, status_code=200, json=self.data_200)
        result = get_unpaywall_data(self.fake_doi, endpoint=self.fake_endpoint)
        expected = self.data_200
        self.assertEqual(result, expected)

    @requests_mock.Mocker()
    def test_connection_error(self, m):
        m.get(self.fake_broken_endpoint, status_code=404)
        result = get_unpaywall_data(self.fake_doi, endpoint=self.fake_endpoint)
        expected = None
        self.assertEqual(result, expected)

    @requests_mock.Mocker()
    def test_get_data_from_unindexed_doi(self, m):
        m.get(self.fake_broken_endpoint, status_code=404)
        result = get_unpaywall_data(doi=self.fake_doi, endpoint=self.fake_endpoint)
        expected = None
        self.assertEqual(result, expected)

    @requests_mock.Mocker()
    def test_landing_url_present(self, m):
        m.get('https://api.unpaywall.org/v2/1289018729847?email=pubs_tech_group%40usgs.gov', status_code=200, json=self.landing_present)
        pubdata = has_oa_link(self.landing_present)
        self.assertTrue('openAccessLink' in pubdata.keys())

    @requests_mock.Mocker()
    def test_null_landing(self, m):
        m.get('https://api.unpaywall.org/v2/1289018729847?email=pubs_tech_group%40usgs.gov', status_code=200, json=self.null_landing)
        result = has_oa_link(self.null_landing)
        self.assertFalse('openAccessLink' in result.keys())

    def test_doi_is_None(self):
        result = get_unpaywall_data(None, endpoint=self.fake_endpoint)
        expected = None
        self.assertEqual(result, expected)


class CheckPublicAccessTestCase(unittest.TestCase):
    # pylint: disable=C0103
    def setUp(self):
        self.current_date = arrow.get('2017-11-01')
        self.pubdata_future_disp_pub_date = {'displayToPublicDate': '2016-11-25T00:00:00'}
        self.pubdata_past_disp_pub_date = {'displayToPublicDate': '2016-10-25T00:00:00'}
        self.pubdata_past_disp_pub_date_before_oct_1_2016 = {'displayToPublicDate': '2016-09-01T00:00:00'}
        self.future_online_date = arrow.get('2016-12-01')
        self.past_online_date_after_oct_1_2016 = arrow.get('2016-10-15')
        self.past_online_date_before_oct_1_2016 = arrow.get('2016-09-01')

    def test_online_date_less_than_one_year_ago(self):
        result = check_public_access(pubdata=self.pubdata_future_disp_pub_date,
                                     online_date_arrow=self.future_online_date,
                                     current_date_time=self.current_date)
        expected = False
        self.assertEqual(result, expected)

    def test_online_date_more_than_one_year_ago_and_after_oct_1_2016(self):
        result = check_public_access(pubdata=self.pubdata_past_disp_pub_date,
                                     online_date_arrow=self.past_online_date_after_oct_1_2016,
                                     current_date_time=self.current_date)
        expected = True
        self.assertEqual(result, expected)

    def test_online_date_more_than_one_year_ago_and_before_oct_1_2016(self):
        result = check_public_access(pubdata=self.pubdata_past_disp_pub_date_before_oct_1_2016,
                                     online_date_arrow=self.past_online_date_before_oct_1_2016,
                                     current_date_time=self.current_date)
        expected = False
        self.assertEqual(result, expected)

    def test_disp_pub_date_less_than_one_year_ago(self):
        result = check_public_access(pubdata=self.pubdata_future_disp_pub_date,
                                     online_date_arrow=None, current_date_time=self.current_date)
        expected = False
        self.assertEqual(result, expected)

    def test_disp_pub_date_more_than_one_year_ago_and_after_oct_1_2016(self):
        result = check_public_access(pubdata=self.pubdata_past_disp_pub_date,
                                     online_date_arrow=None,
                                     current_date_time=self.current_date)
        expected = True
        self.assertEqual(result, expected)

    def test_disp_pub_date_more_than_one_year_ago_and_before_oct_1_2016(self):
        result = check_public_access(pubdata=self.pubdata_past_disp_pub_date_before_oct_1_2016,
                                     online_date_arrow=None,
                                     current_date_time=self.current_date)
        expected = False
        self.assertEqual(result, expected)


class GetPublishedOnlineDateTestCase(unittest.TestCase):

    def setUp(self):
        self.good_crossref_data = crossref_200_ok
        self.not_good_crossref_data = crossref_200_not_ok
        self.good_crossref_2_parts = crossref_200_ok_2_date_parts
        self.good_crossref_1_part = crossref_200_ok_1_date_part
        self.ok_no_published_online = crossref_200_ok_message_empty

    def test_not_ok_data(self):
        result = get_published_online_date(self.not_good_crossref_data)
        expected = None
        self.assertEqual(result, expected)

    def test_ok_data_3_parts(self):
        result = get_published_online_date(self.good_crossref_data)
        expected = arrow.get(2016, 12, 9)
        self.assertEqual(result, expected)

    def test_ok_data_2_parts(self):
        result = get_published_online_date(self.good_crossref_2_parts)
        expected = arrow.get(2016, 12, 1)
        self.assertEqual(result, expected)

    def test_ok_data_1_part(self):
        result = get_published_online_date(self.good_crossref_1_part)
        expected = None
        self.assertEqual(result, expected)

    def test_ok_data_no_online_date(self):
        result = get_published_online_date(self.ok_no_published_online)
        expected = None
        self.assertEqual(result, expected)

    def test_crossref_is_none(self):
        result = get_published_online_date(None)
        expected = None
        self.assertEqual(result, expected)


class UpdateGeographicExtentsTestCase(unittest.TestCase):
    # pylint: disable=C0103
    def setUp(self):
        self.record = {'indexId': '1234', 'title': 'Title 1'}

    def test_record_with_no_geographic_extents(self):
        update_geographic_extents(self.record)
        self.assertEqual({'indexId': '1234', 'title': 'Title 1'}, self.record)

    def test_record_with_empty_geographic_extents(self):
        self.record['geographicExtents'] = ''
        update_geographic_extents(self.record)

        self.assertFalse('geographicExtentns' in self.record)

    def test_record_with_geographic_extents_with_invalid_json(self):
        self.record['geographicExtents'] = 'asdfasdfasdf'
        update_geographic_extents(self.record)
        self.assertFalse('geographicExtents' in self.record)

    def test_record_with_geographic_extents_with_single_feature(self):
        self.record['geographicExtents'] = '{"type" : "Feature", "geometry": {"type": "Polygon", ' \
            + '"coordinates": [[ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]]}}'
        update_geographic_extents(self.record)

        self.assertTrue('geographicExtents' in self.record)
        extents = self.record.get('geographicExtents')
        self.assertEqual(extents.get('type'), 'FeatureCollection')
        self.assertEqual(extents.get('properties'), {'title': 'Title 1'})
        features = extents.get('features', [])
        self.assertEqual(len(features), 1)
        self.assertEqual(features[0].get('geometry').get('type'), 'Polygon')
        self.assertEqual(features[0].get('properties').get('title'), 'Title 1')
        self.assertEqual(features[0].get('properties').get('id'), '1234')

    def test_record_with_geographic_extents_with_feature_collection(self):
        self.record['geographicExtents'] = '{"type": "FeatureCollection", "features": [' \
            + '{"type": "Feature",' \
            +' "geometry": {"type": "Polygon", ' \
            + '"coordinates": [[ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]]}}]}'

        update_geographic_extents(self.record)

        self.assertTrue('geographicExtents' in self.record)
        extents = self.record.get('geographicExtents')
        self.assertEqual(extents.get('type'), 'FeatureCollection')
        self.assertEqual(extents.get('properties'), {'title': 'Title 1'})
        features = extents.get('features', [])
        self.assertEqual(len(features), 1)
        self.assertEqual(features[0].get('geometry').get('type'), 'Polygon')
        self.assertEqual(features[0].get('properties').get('title'), 'Title 1')
        self.assertEqual(features[0].get('properties').get('id'), '1234')


class SearchPublicationsGetPubsSearchResultsTestCase(unittest.TestCase):
    # pylint: disable=C0103
    @requests_mock.Mocker()
    def test_bad_status_response(self, m):
        search_publications = SearchPublications('https://fake.com/search')
        m.get('https://fake.com/search', text="Server Error", status_code=500)
        result, status = search_publications.get_pubs_search_results()

        self.assertIsNone(result)
        self.assertEqual(status, 500)

    @requests_mock.Mocker()
    def test_good_status_with_valid_json(self, m):
        search_publications = SearchPublications('https://fake.com/search')
        m.get('https://fake.com/search', json={"a": 1, "b": 2})
        result, status = search_publications.get_pubs_search_results()

        self.assertEqual(result, {"a": 1, "b": 2})
        self.assertEqual(status, 200)

    @requests_mock.Mocker()
    def test_good_status_with_invalid_json(self, m):
        search_publications = SearchPublications('https://fake.com/search')
        m.get('https://fake.com/search', text="Hello")
        result, status = search_publications.get_pubs_search_results()

        self.assertIsNone(result)
        self.assertEqual(status, 200)

    @patch('requests.get')
    def test_request_without_params(self, mock_get):
        search_publications = SearchPublications('https://fake.com/search')
        search_publications.get_pubs_search_results()

        self.assertIsNone(mock_get.call_args[1]['params'])

    @patch('requests.get')
    def test_request_with_params(self, mock_get):
        search_publications = SearchPublications('https://fake.com/search')
        search_publications.get_pubs_search_results({'param1': 'V1', 'param2': 'V2'})

        self.assertEqual(mock_get.call_args[1]['params'], {'param1': 'V1', 'param2': 'V2'})
