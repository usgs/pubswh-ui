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
	
	Scenario: Pubs JSON does not contain a seriesTitle
		Given I have JSON that does not contain a series title
		When I create a pub info string without a series title
		Then I should see a info string with publication type and year
		
	Scenario: Pubs JSON does not contain a seriesTitle with larger work
		Given I have JSON that does not control a series title with larger work title
		When I create a pub info string from JSON without series title but with larger work title
		Then I should see an info string with publication year and larger work title
		
	Scenario: Pubs JSON article does not contain a start page
		Given I have publication JSON from an article without a start page
		When I create a pub info string for a pub without a start page
		Then I should see an info string with publication year and series title