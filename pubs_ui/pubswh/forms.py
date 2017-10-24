__author__ = 'jameskreft'

from flask_wtf import Form, RecaptchaField
from wtforms import StringField, TextAreaField, SubmitField, validators, BooleanField, HiddenField, PasswordField, SelectField
from wtforms.fields.html5 import SearchField, DateField
from pubs_ui import app


class ContactForm(Form):
    name = StringField("Name")
    email = StringField("Email", [validators.Email()]) # email validator also makes this a required field... a blank email is considered invalid
    originating_page = StringField("Originating Page")
    message = TextAreaField("Message")
    recaptcha = RecaptchaField()
    submit = SubmitField("Send")


class PublicAccessContactForm(Form):
    name = StringField("Name")
    email = StringField("Email", [validators.Email()]) # email validator also makes this a required field... a blank email is considered invalid
    originating_page = StringField("Originating Page")
    message = TextAreaField("Message", default="I would like to request the full-text public access version of the following publication" )
    recaptcha = RecaptchaField()
    submit = SubmitField("Send")


class NumSeries(Form):
    num_series = BooleanField('Only USGS Numbered Series')
    date_range = DateField('Include publications back to date:   ')


