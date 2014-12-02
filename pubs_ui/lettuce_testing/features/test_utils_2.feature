Feature: Test more pubs ui utilities
	In order to check that our utilites are handling data correctly
	As a developer who knows the internal and external workings of pubs_ui
	We will test the functionality and behavior of all our utility functions

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
