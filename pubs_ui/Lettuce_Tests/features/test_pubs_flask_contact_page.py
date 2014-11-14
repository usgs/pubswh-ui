'''
Created on Nov 14, 2014

@author: ayan
'''

from lettuce import world, step
from nose.tools import assert_true, assert_equals
from pubs_ui import app

# Contact page responds with a contact form
@step
def i_have_the_url_to_the_contact_page(step):
    world.contact_url = '/contact'

@step
def i_have_set_up_a_client_for_the_contact_page(step):
    world.client = app.test_client()
    
@step
def i_access_the_contact_page_through_the_url(step):
    with world.client as c:
        response = c.get(world.contact_url)
    world.response_content = response.get_data()
    
@step
def i_should_see_a_contact_form_with_an_email_field(step):
    email_field_index = world.response_content.find('name="email"')
    if email_field_index > -1:
        world.field_found = True
    else:
        world.field_found = False
    assert_true(world.field_found)
    

# Email field contains a invalid email
@step
def i_have_created_an_invalid_email(step):
    world.contact_url = '/contact'
    world.invalid_email = 'invalid!usgs.gov'
    world.test_client = app.test_client()
    
@step
def i_put_an_invalid_email_in_the_email_field(step):
    post_response = world.test_client.post(world.contact_url, data=dict(email=world.invalid_email), follow_redirects=True)
    world.post_response_content = post_response.get_data()
    
@step
def i_should_see_an_invalid_email_message_on_return(step):
    world.invalid_message = 'Invalid email address'
    invalid_message_index = world.post_response_content.find(world.invalid_message)
    if invalid_message_index > -1:
        invalid_message_found = True
    else:
        invalid_message_found = False
    assert_true(invalid_message_found)
    
    
# Successful form submittal message
@step
def i_have_filled_out_the_firm_with_at_least_a_message_and_email_and_filled_out_the_captcha(step):
    world.contact_url = '/contact'
    world.test_client = app.test_client()
    world.contact_data = {
                          'name': 'Earl of Lemongrab',
                          'email': 'lemongrab@usgs.gov',
                          'message': 'They did not understand my lemon styles.',
                          'recaptcha_challenge_field': 'test',
                          'recaptcha_response_field': 'test'
                          }
    
@step
def i_submit_the_correctly_filled_out_form(step):
    post_response = world.test_client.post(world.contact_url, data=world.contact_data, follow_redirects=True)
    world.post_response_content = post_response.get_data()
    
@step
def my_form_results_in_a_success_message(step):
    world.confirm_message = 'Thank you for'
    confirm_message_index = world.post_response_content.find(world.confirm_message)
    if confirm_message_index > -1:
        message_found = True
    else:
        message_found = False
    assert_true(message_found)
