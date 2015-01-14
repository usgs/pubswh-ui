Feature: Publication pages
	In order to check that the publication page is working correctly
	As a developer who knows the service calls and page content
	I will test that the publication page responds with the expected content
	
	@WIP1
	Scenario: Publication page with supersede data
		Given I have imitated JSON from the pubs and supersedes API and a client
		When I access the publication page
		Then I should see a 200 status code
		And I should see the some of the fake supersedes content