Feature: Submit help ticket to Remedy via contact page
	In order to get help from the Pubs Warehouse support team
	As a user of the pubs warehouse who has a questions, comment, or problem
	I want to fill out a form on the Pubs Warehouse contact page
	And have the contents submitted to the Remedy ticketing system
	
	@WIP1
	Scenario: Contact page responds with a contact form
		Given I have the URL to the contact page
		And I have set up a client for the contact page
		When I access the contact page through the URL
		Then I should see a contact form with an email field

	@WIP2
	Scenario: Email field contains a invalid email
		Given I have created an invalid email
		When I put an invalid email in the email field
		Then I should see an invalid email message on return
		
	@WIP3
	Scenario: Successful form submittal message
		Given I have filled out the firm with at least a message and email and filled out the captcha
		When I submit the correctly filled out form
		Then my form results in a success message