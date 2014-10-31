Feature: Test all pub_ui utilities
	In order to check that our utilites are handling data correctly
	As a developer who knows the internal and external workings of pubs_ui
	We will test the functionality and behavior of all our utility functions
	
	Scenario: pull_feed functions correctly
		Given I have created a mock url
		And I defined the output we would expect for the mock from pull_feed
		When I register the mock xml and feed it to pull_feed
		Then I see that pull_feed gave the expected output
		
	Scenario: pull_feed behaves correctly
		Given I point to a live feed url on the wiki
		And I define what ouput we would normally expect from this page
		When I run pull_feed under normal circumstances
		Then I see that pull_feed gave the expected output
		
		
		

	Scenario: call_api functions correctly
	Scenario: call_api behaves correctly
	Scenario: pubdetails functions correctly
	Scenario: pubdetails behaves correctly
	Scenario: display_links functions correctly
	Scenario: display_links behaves correctly
	Scenario: supersedes functions correctly
	Scenario: supersedes behaves correctly
	Scenario: getbrowsercontent functions correctly
	Scenario: getbrowsercontent behaves correctly