Feature: Test all pub_ui utilities
	In order to check that our utilites are handling data correctly
	As a developer who knows the internal and external workings of pubs_ui
	We will test the functionality and behavior of all our utility functions
	
	Scenario: pull_feed functions correctly
		Given I have created a mock xml at a mock url
		And I defined the output we would expect for the mock from pull_feed
		When I pull_feed the fake url
		Then I see that pull_feed gave the expected output
		
	Scenario: pull_feed behaves correctly
		Given I point to a live feed url on the wiki
		And I define what ouput we would normally expect from this page
		When I run pull_feed under normal circumstances
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
		Then I am returned a location for the links, breadcrumbs, and titles
		
	Scenario: getbrowsercontent behaves correctly