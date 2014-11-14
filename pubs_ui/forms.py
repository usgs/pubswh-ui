__author__ = 'jameskreft'

from flask.ext.wtf import Form
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.fields.html5 import SearchField, EmailField


class ContactForm(Form):
    name = StringField("Name")
    email = EmailField("Email")
    subject = StringField("Subject")
    message = TextAreaField("Message")
    submit = SubmitField("Send")


class SearchForm(Form):
    q = SearchField("Search Terms")