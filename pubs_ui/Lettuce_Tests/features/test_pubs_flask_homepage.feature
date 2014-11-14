Feature: Test that pubs_ui views are working
	In order to check that the views is working correctly
	As a developer who knows the URLs and page behavior
	We will test that the views respond with the expected status code
	
	Scenario: Homepage responds if service is broken
		Given I have imitated a failing search service from pubs 
		And I created a Flask client to test the homepage with the failing service
		When I access the homepage URL with the failing service backend
		Then I should see a 200 status code from the homepage
	
	Scenario: Homepage responds if service is working
		Given I have imitated a working search service from pubs
		And I created a Flask client to test the homepage with the working service
		When I access the homepage URL with the working service
		Then I should see the imitated pubs content on the page