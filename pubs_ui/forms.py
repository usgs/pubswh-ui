__author__ = 'jameskreft'

from flask.ext.wtf import Form, RecaptchaField
from wtforms import StringField, TextAreaField, SubmitField, validators, BooleanField, HiddenField, PasswordField, SelectField
from wtforms.fields.html5 import SearchField, DateField
from wtforms.validators import DataRequired
from pubs_ui import app
from requests import get
lookup_url = app.config['LOOKUP_URL']

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
    #seriesName = StringField("Series Name")

    seriesNameList = []
    for series in get(lookup_url + 'publicationseries', params={'mimetype': 'json'}).json():
        seriesNameList.append((series['id'], series['text']))
    seriesName = SelectField(label="Series Name", choices=seriesNameList)

    reportNumber = StringField("Report Number")
    advanced = HiddenField('advanced')


class NumSeries(Form):
    num_series = BooleanField('num_series')
    date_range = DateField('date_range')



class LoginForm(Form):
    username = StringField('username', validators=[DataRequired()])
    password = PasswordField('password', validators=[DataRequired()])

