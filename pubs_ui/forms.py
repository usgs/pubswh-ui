__author__ = 'jameskreft'

from flask.ext.wtf import Form, RecaptchaField
from wtforms import StringField, TextAreaField, SubmitField, validators, BooleanField, HiddenField
from wtforms.fields.html5 import SearchField, DateField


class ContactForm(Form):
    name = StringField("Name")
    email = StringField("Email", [validators.Email()]) # email validator also makes this a required field... a blank email is considered invalid
    message = TextAreaField("Message")
    recaptcha = RecaptchaField()
    submit = SubmitField("Send")


class SearchForm(Form):
    q = SearchField("Search for Publications")
    title = StringField("Title")
    contributor = StringField("Contributor Name")
    year = StringField("Year Published")
    contributingOffice = StringField("Contributing Office")
    typeName = StringField("Publication Type")
    subtypeName = StringField("Publication Subtype")
    seriesName = StringField("Series Name")
    reportNumber = StringField("Report Number")
    advanced = HiddenField('advanced')


class NumSeries(Form):
    num_series = BooleanField('num_series')
    date_range = DateField('date_range')