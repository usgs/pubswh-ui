__author__ = 'jameskreft'

from flask.ext.wtf import Form, RecaptchaField
from wtforms import StringField, TextAreaField, SubmitField, validators, BooleanField
from wtforms.fields.html5 import SearchField


class ContactForm(Form):
    name = StringField("Name")
    email = StringField("Email", [validators.Email()]) # email validator also makes this a required field... a blank email is considered invalid
    message = TextAreaField("Message")
    recaptcha = RecaptchaField()
    submit = SubmitField("Send")


class SearchForm(Form):
    q = StringField("Search for Publications")
    title = StringField("Title")
    contributor = StringField("Author Name")
    year = StringField("Year Published")
    contributingOffice = StringField("Contributing Office")


class NumSeries(Form):
    num_series = BooleanField('num_series')