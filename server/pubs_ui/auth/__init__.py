from itsdangerous import URLSafeTimedSerializer

from .. import app

# Login_serializer used to encrypt and decrypt the cookie token for the remember
# me option of flask-login
# URLSafeTimedSerializer which allows us to have a max_age on the token itself.  When the cookie is stored
#on the users computer it also has a exipry date, but could be changed by
#the user, so this feature allows us to enforce the exipry date of the token
#server side and not rely on the users cookie to exipre.
login_serializer = URLSafeTimedSerializer(app.secret_key)
