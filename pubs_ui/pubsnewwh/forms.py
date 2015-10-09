__author__ = 'jameskreft'

from flask.ext.wtf import Form, RecaptchaField
from wtforms import StringField, TextAreaField, SubmitField, validators, BooleanField, HiddenField, PasswordField, SelectField
from wtforms.fields.html5 import SearchField, DateField
from wtforms.validators import DataRequired
from pubs_ui import app
from requests import get

lookup_url = app.config['LOOKUP_URL']
# should requests verify the certificates for ssl connections
verify_cert = app.config['VERIFY_CERT']


def get_field_list(lookup_name, parameters=None):
    '''
    Using the lookup URL from the local settings this function will make a list of all the records in the json response
    for a lookup field. Used for creating dropdown select fields in the advanced search form.
    :param lookup_name: The name of the publication lookup type.
    :param parameters: parameters to be added to the query, needs to be a dictionary
    :return: An unordered list of all the response records.
    '''
    field_list = []
    base_params = {'mimetype': 'json'}
    #add the mimetype param in addition to the rest of the parameters
    if parameters is None:
        params = base_params
    else:
        params = dict(parameters.items() + base_params.items())
    # catch errors from killing page builds
    try:
        records = get(lookup_url + lookup_name, params=params, verify=verify_cert).json()
    except:
        records = [{'text': 'error'}, {'text': 'error1'}, {'text': 'error2'}, {'text': 'error3'}, {'text': 'error4'}]

    for record in records:
        field_list.append((record['text'], record['text']))
    field_list.insert(0, ('', ''))
    deduped_field_list = list(set(field_list))
    return deduped_field_list


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
    startYear = StringField("Published starting in")
    endYear = StringField("Published in or before")

    #Grabs the list of Contributing Office names and IDs from the lookup url. Then puts them into the selectfield list
    contributorList = get_field_list('costcenters')
    contributingOffice = SelectField(label="Contributing Office", choices=sorted(contributorList))

    #Grabs the list of Publication Types names and IDs from the lookup url. Then puts them into the selectfield list
    typeList = get_field_list('publicationtypes')
    typeName = SelectField(label="Publication Type", choices=sorted(typeList))

    #Grabs the list of Publication Subtypes names and IDs from the lookup url. Then puts them into the selectfield list
    subtypeNameList = get_field_list('publicationsubtypes')
    subtypeName = SelectField(label="Publication Subtype", choices=sorted(subtypeNameList))

    #Grabs the list of Publication Series names and IDs from the lookup url. Then puts them into the selectfield list
    seriesNameList = get_field_list('publicationseries')
    seriesName = SelectField(label="Series Name", choices=sorted(seriesNameList))

    reportNumber = StringField("Report Number")
    g = HiddenField();
    advanced = HiddenField()


class NumSeries(Form):
    num_series = BooleanField('Only USGS Numbered Series')
    date_range = DateField('Include publications back to date:   ')



class LoginForm(Form):
    username = StringField('AD Username:', validators=[DataRequired()])
    password = PasswordField('AD Password:', validators=[DataRequired()])

