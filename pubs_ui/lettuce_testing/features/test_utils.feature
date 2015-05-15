Feature: Test all pub_ui utilities
	In order to check that our utilites are handling data correctly
	As a developer who knows the internal and external workings of pubs_ui
	We will test the functionality and behavior of all our utility functions
	
	Scenario: pull_feed functions correctly
		Given I have created a mock xml at a mock url
		And I defined the output we would expect for the mock from pull_feed
		When I pull_feed the fake url
		Then I see that pull_feed gave the expected output

	Scenario: pubdetails functions correctly
		Given I have some fake json pubs metadata
		When I find fake details with pubdetails
		Then I am returned an expected result
		
	Scenario: pubdetails behaves correctly
		Given I point to a real pubs url
		When I find real details with pubdetails
		Then I am returned an expected result

	Scenario: create_display_links functions correctly
		Given I have a fake json full of pubs-related links
		When I create_display_links using the dummy list
		Then I am given a list of links for use in the jinja template

	Scenario: create_display_links behaves correctly
		Given I point to a real pubs url
		When I create_display_links from the pub's response
		Then I am given a list of links for use in the jinja template

	Scenario: getbrowsercontent functions correctly
		Given I have a mockup url and body of pubs browse links
		When I get the links, breadcrumbs, and titles from the url
		Then I am returned a list for the links, breadcrumbs, and titles

    Scenario: manipulate_display_links
        Given I have a index page links that point to USGS and NGMDB and has plates
        When I manipulate the links with create display links
        Then I get the rejiggered display links that I expect
		
	Scenario: getbrowsercontent behaves correctly
		Given I point to a real pubs browse url
		When I get the links, breadcrumbs, and titles from the url
		Then I am returned a list for the links, breadcrumbs, and titles

	Scenario: jsonify_geojson functions correctly with a geographic extents string from pubs warehouse
        Given we have created a fake pubs record with a geographic extents string
        When I make a record with parsable json
        Then I see a record was created correctly

    Scenario: jsonify_geojson drops the record if the json parse fails
        Given we have created a fake pubs record with an invalid geographic extents string
        When I try to make a record with parseable json and catch an error
        Then I see the record has geographicExtents dropped

	Scenario: add_relationships_graphs functions correctly with a store item
	  	Given I have a mockup pubs legacy url that has a store item
	  	When I make a dict object with the store offer information
	  	Then I see that the store information has been listed correctly

  	Scenario: add_relationships_graphs functions add offers if they are there
		Given I have a mocked base publication record, a base url, and a mocked legacy endpoint
        When I pass those store variables to add_relationships_graphs
		Then The offers portion of the pub record should contain what I expect

    Scenario: add_relationships_graphs adds relationships from new endpoint
        Given I have a mocked base publication record that has a populated interactions data element, and a base url
        When I pass those interactions variables to add_relationships_graphs
        Then the relationships data element of the pubs record should contain what I expect

	Scenario: make_contributor_list functions correctly
		Given we have imitated the authors data we would see from pubs
		When I make a list with only authors
		Then I see that the list was made correctly
		When I make a list with only organizations
		Then I see that the list was made correctly
		When I make a list with both authors and organizations
		Then I see that the list was made correctly

	Scenario: SearchPublications functions correctly with data
		Given we have created a fake url and mocked pubs responses
		When I search through the publications
		Then I am given the appropriate responses

	Scenario: SearchPublications functions correctly with down service
		Given we have created a fake url and mocked a down service
		When I search through the failed service
		Then I am given the appropriate responses
	
	Scenario: Sorting of a list of dictionaries works correctly
		Given I have a list of dictionaries
		When I provide the list and a valid key name
		Then I see a list sorted by the specified key
	
	Scenario: Parsing of supersedes info works correctly
		Given I have mocked some publication JSON
		When I pass the JSON to extract_related_pub_info
		Then I see a dictionary containing the preceding and superseding publications

    Scenario: An H1 tag at the beginning of an abstact is removed and the contents put in an abstract header
        Given There is an publication record with a docAbstract that contains an H1 tag
        When I pass the publication record to munge_abstract
        Then I see a dictionary containing the abstractHeader data element and no h1 tags in the docAbstract data element