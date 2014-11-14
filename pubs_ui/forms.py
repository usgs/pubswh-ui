__author__ = 'jameskreft'

from flask.ext.wtf import Form, RecaptchaField
from wtforms import StringField, TextAreaField, SubmitField, validators
from wtforms.fields.html5 import SearchField


class ContactForm(Form):
    name = StringField("Name")
    email = StringField("Email", [validators.Email()])
    message = TextAreaField("Message")
    recaptcha = RecaptchaField()
    submit = SubmitField("Send")


class SearchForm(Form):
    q = SearchField("Search Terms")