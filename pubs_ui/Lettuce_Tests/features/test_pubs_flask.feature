Feature: Test Pubs Flask is working
	In order to check that our Flask app is functioning
	As a someone concerned with Flask interactivity
	We will poke at the responses Flask should give us

	Scenairo: Test Index
		Given I have a mock json
		When I get the response code with the app
		Then I find the status code I expected

	Scenario: Test API Web Args Search Query
		Given I have state_name query to search
		When I request context from the app
		Then I am given state_name as the query parameter

	Scenario: Test API Web Arg Search Response
		Given I have a mock json
		When I get the query response code	
		Then I find the status code I expect
	
	Scenario: Test Contact Page
		Given I have a contact url
		When I look for a response from the app
		Then I find the status code I expect

