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

    #Grabs the list of Contributing Office names and IDs from the lookup url. Then puts them into the selectfield list
    contributorList = []
    for type in get(lookup_url + 'costcenters', params={'mimetype': 'json'}).json():
        contributorList.append((type['id'], type['text']))
    contributingOffice = SelectField(label="Contributing Office", choices=sorted(contributorList))

    #Grabs the list of Publication Types names and IDs from the lookup url. Then puts them into the selectfield list
    typeList = []
    for type in get(lookup_url + 'publicationtypes', params={'mimetype': 'json'}).json():
        typeList.append((type['id'], type['text']))
    typeName = SelectField(label="Type Name", choices=sorted(typeList))

    #Grabs the list of Publication Subtypes names and IDs from the lookup url. Then puts them into the selectfield list
    subtypeNameList = []
    for name in get(lookup_url + 'publicationsubtypes', params={'mimetype': 'json'}).json():
        subtypeNameList.append((name['id'], name['text']))
    subtypeName = SelectField(label="Subtype Name", choices=sorted(subtypeNameList))

    #Grabs the list of Publication Series names and IDs from the lookup url. Then puts them into the selectfield list
    seriesNameList = []
    for series in get(lookup_url + 'publicationseries', params={'mimetype': 'json'}).json():
        seriesNameList.append((series['id'], series['text']))
    seriesName = SelectField(label="Series Name", choices=sorted(seriesNameList))

    reportNumber = StringField("Report Number")
    advanced = HiddenField('advanced')


class NumSeries(Form):
    num_series = BooleanField('Only USGS Numbered Series')
    date_range = DateField('Include publications back to date:   ')



class LoginForm(Form):
    username = StringField('username', validators=[DataRequired()])
    password = PasswordField('password', validators=[DataRequired()])

