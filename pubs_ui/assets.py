
from flask.ext.assets import Environment, Bundle

from . import app

bundles={
    'js_base_libs' : Bundle(
        'pubswh/js/vendor/bootstrap.js',
        'pubswh/js/plugins.js',
        filters='rjsmin',
        output='js/base_libs.js'
    ),
    'js_advanced_search' : Bundle(
        'pubswh/js/select2.js',
        'pubswh/js/searchMap.js',
        'pubswh/js/clearFeatureControl.js',
        filters='rjsmin',
        output='js/advanced_search.js'
    ),
    'css_base' : Bundle(
        'pubswh/css/normalize.css',
        'pubswh/css/main.css',
        'pubswh/css/bootstrap.css',
        'pubswh/css/select2.css',
        'pubswh/css/select2-bootstrap.css',
        filters='cssmin',
        output='css/min_base.css'
    ),
    'manager_style' : Bundle(
        'manager/css/usgs_header_footer.css',
        filters='cssmin',
        output='css/manager_style.css'
    )
}

assets = Environment(app)
assets.register(bundles)

