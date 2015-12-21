from itsdangerous import URLSafeTimedSerializer

from .. import app

# Login_serializer used to encrypt and decrypt the cookie token for the remember
# me option of flask-login
login_serializer = URLSafeTimedSerializer(app.secret_key)