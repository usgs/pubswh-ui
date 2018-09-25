from unittest import TestCase, mock

from flask import request, session

from ... import app
from ..views import authentication_required, is_authenticated, get_auth_header


class TestAuthenticationRequired(TestCase):
    mock_time = mock.Mock()
    mock_time.return_value = 1234567

    def setUp(self):
        self.app_client = app.test_client()

    def test_authentication_no_expiration_time(self):
        view_mock = mock.Mock()
        app.config['WATERAUTH_AUTHORIZE_URL'] = 'https://fake.auth.com'
        with app.test_request_context('/mock'):
            authentication_required(view_mock)()

        view_mock.assert_not_called()

    @mock.patch('time.time', mock_time)
    def test_authentication_expiration_time_earlier_than_current_time(self):
        view_mock = mock.Mock()
        app.config['WATERAUTH_AUTHORIZE_URL'] = 'https://fake.auth.com'
        with app.test_request_context('/mock'):
            session['access_token_expires_at'] = 1234566
            authentication_required(view_mock)()

        view_mock.assert_not_called()

    @mock.patch('time.time', mock_time)
    def test_authentication_expiration_time_later_than_current_time(self):
        view_mock = mock.Mock()
        app.config['WATERAUTH_AUTHORIZE_URL'] = 'https://fake.auth.com'
        with app.test_request_context('/mock'):
            session['access_token_expires_at'] = 1234568
            authentication_required(view_mock)()

        view_mock.assert_called()

class TestIsAuthenticated(TestCase):
    mock_time = mock.Mock()
    mock_time.return_value = 1234567

    def setUp(self):
        self.app_client = app.test_client()

    def test_no_access_token_expires_at_in_session(self):
        with app.test_request_context():
            self.assertFalse(is_authenticated())

    @mock.patch('time.time', mock_time)
    def test_good_access_token(self):
        with app.test_request_context():
            session['access_token_expires_at'] = 1234568
            self.assertTrue(is_authenticated())

    @mock.patch('time.time', mock_time)
    def test_expired_access_token(self):
        with app.test_request_context():
            session['access_token_expires_at'] = 1234566
            self.assertFalse(is_authenticated())

class TestGetAuthHeader(TestCase):
    def setUp(self):
        self.app_client = app.test_client()

    def test_no_access_token(self):
        with app.test_request_context():
            self.assertEqual(get_auth_header(), {})

    def test_access_token(self):
        with app.test_request_context():
            access_token = {'access_token': 'fake.token.pubs'}
            request.cookies = access_token
            self.assertEqual(get_auth_header()['Authorization'], 'Bearer fake.token.pubs')