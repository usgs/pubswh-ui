Feature: Test custom Jinja2 filter display_publication_info
	In order to check that the filters are working correctly
	As a developer who knows the form and content of responses from pubs services and behavior of pubs_ui
	We will test functionality of the custom filters
	
	Scenario: Pubs JSON contains chapter and subchapter
		Given I have JSON with a chapter and subchapter
		When I create a pub info string with chapter and subchapter
		Then I should see a string with chapter and subchapter
		
	Scenario: Pubs JSON contains chapter and no subchapter
		Given I have JSON with a chapter and no subchapter
		When I create a pub info string using chapter no subchapter
		Then I should see a string with chapter and no subchapter
		
	Scenario: Pubs JSON contains publication type with end page with no volume
		Given I have JSON with a publication type and end page and no volume
		When I create a pub info string using the pub type and end page JSON
		Then I should see a string without the volume and with end page
		
	Scenario: Pubs JSON contains publication type and end page and volume
		Given I have JSON using pub type and end page and volume
		When I create a pub info string using pub type and end page and volume
		Then I should see a string with volume and end page
		
	Scenario: Pubs JSON does not contain chapter
		Given I have JSON that does not have a chapter
		When I create a pub info string without a chapter
		Then I should see a string with year and title and series number