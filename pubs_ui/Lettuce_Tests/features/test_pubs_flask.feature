Feature: Test Pubs Flask is working
	In order to check that our Flask app is functioning
	As a someone concerned with Flask interactivity
	We will poke at the responses Flask should give us

	Scenairo: Test Index
		Given I have a mock json
		When I get the response code with the app
		I see it's the 200 status code I expected