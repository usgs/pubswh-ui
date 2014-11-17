'''
Created on Nov 14, 2014

@author: ayan
'''

from lettuce import world, step
from nose.tools import assert_in, assert_equal
from pubs_ui import app, mail

"""
Contact page responds with a contact form
"""
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
    #email_field_index = world.response_content.find('name="email"')
    world.expected_email_field_index = 'name="email"'
    assert_in(world.expected_email_field_index, world.response_content)
    

"""
Email field contains a invalid email
"""
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
    assert_in(world.invalid_message, world.post_response_content)

    
"""    
Successful form submittal message
"""
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
    with mail.record_messages() as outbox:
        post_response = world.test_client.post(world.contact_url, data=world.contact_data, follow_redirects=True)
    world.outbox = outbox
    world.post_response_content = post_response.get_data()
    
@step
def my_form_results_in_a_success_message(step):
    world.confirm_message = 'Thank you for'
    assert_in(world.confirm_message, world.post_response_content)
    
@step
def the_email_is_sent_to_the_recipents_specified_in_settings_with_correct_headings(step):
    outbox_len = len(world.outbox)
    assert_equal(outbox_len, 1)
    
    message_sender = world.outbox[0].sender
    expected_sender = 'Earl of Lemongrab <lemongrab@usgs.gov>'
    assert_equal(message_sender, expected_sender)
    
    message_recipient = world.outbox[0].recipients
    expected_recipient = app.config['CONTACT_RECIPIENTS']
    assert_equal(message_recipient, expected_recipient)
    
    message_subject = world.outbox[0].subject
    expected_subject = 'Pubs Warehouse User Comments'
    assert_equal(message_subject, expected_subject)