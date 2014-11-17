Feature: Navigation bar search bar
	One way to search through Pubs is to enter a search parameter into the search field in the nav bar
	As a developer to knows the backend search API
	I will test that the search field in the  nav bar behaviors correctly
	
	@WIP1
	Scenario: Search bar with broken service
		Given I have imitated a failing search service from pubs
		And I created a Flask client to test the search with the failing service
		When I access the search URL with a simulated query
		Then I should see a 200 status code from the search page
		
	@WIP2
	Scenario: Search bar with working search
		Given I have imitated a working search service from pubs
		And I created a Flask client to access the search with the working service
		When I access the search URL with a simulated query string
		Then I should see the fake content I created in the response