__author__ = 'jameskreft'

from flask.ext.wtf import Form, RecaptchaField
from wtforms import StringField, TextAreaField, SubmitField, validators, BooleanField, HiddenField, PasswordField, SelectField
from wtforms.fields.html5 import SearchField, DateField
from wtforms.validators import DataRequired
from pubs_ui import app
from requests import get

lookup_url = app.config['LOOKUP_URL']


def get_field_list(lookup_name):
    '''
    Using the lookup URL from the local settings this function will make a list of all the records in the json response
    for a lookup field. Used for creating dropdown select fields in the advanced search form.
    :param lookup_name: The name of the publication lookup type.
    :return: An unordered list of all the response records.
    '''
    field_list = []
    for record in get(lookup_url + lookup_name, params={'mimetype': 'json'}).json():
        field_list.append((record['id'], record['text']))
    return field_list


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
    contributorList = get_field_list('costcenters')
    contributingOffice = SelectField(label="Contributing Office", choices=sorted(contributorList))

    #Grabs the list of Publication Types names and IDs from the lookup url. Then puts them into the selectfield list
    typeList = get_field_list('publicationtypes')
    typeName = SelectField(label="Type Name", choices=sorted(typeList))

    #Grabs the list of Publication Subtypes names and IDs from the lookup url. Then puts them into the selectfield list
    subtypeNameList = get_field_list('publicationsubtypes')
    subtypeName = SelectField(label="Subtype Name", choices=sorted(subtypeNameList))

    #Grabs the list of Publication Series names and IDs from the lookup url. Then puts them into the selectfield list
    seriesNameList = get_field_list('publicationseries')
    seriesName = SelectField(label="Series Name", choices=sorted(seriesNameList))

    reportNumber = StringField("Report Number")
    advanced = HiddenField('advanced')


class NumSeries(Form):
    num_series = BooleanField('Only USGS Numbered Series')
    date_range = DateField('Include publications back to date:   ')



class LoginForm(Form):
    username = StringField('username', validators=[DataRequired()])
    password = PasswordField('password', validators=[DataRequired()])

