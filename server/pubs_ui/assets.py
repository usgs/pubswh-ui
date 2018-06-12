

from flask_assets import Environment, Bundle

from . import app

base_metrics_js = Bundle(
    'metrics/js/analyticsData.js',
    'metrics/js/analyticsGraph.js',
    'metrics/js/dataUtils.js',
)
bundles={
    'metrics_publications_js' : Bundle(
        base_metrics_js,
        Bundle('metrics/js/pubsGraphController.js'),
        filters='rjsmin',
        output='gen/metrics_publications.js'
    ),
    'metrics_publications_aquisition_js' : Bundle(
        base_metrics_js,
        Bundle('metrics/js/pubsAcquisitionGraphController.js'),
        filters='rjsmin',
        output='gen/metrics_publications_acquisition.js'
    ),
    'metrics_publication_js': Bundle(
        base_metrics_js,
        Bundle('metrics/js/pubGraphController.js'),
        filters='rjsmin',
        output='gen/metrics_publication_js'
    ),

    'usgs_style' : Bundle(
        '../../../assets/styles/manager/usgs_header_footer.less',
        filters='less,cssmin',
        output='gen/usgs_style.css'
    ),
    'css_base' : Bundle(
        'pubswh/css/normalize.css',
        'pubswh/css/main.css',
        filters='cssmin',
        output='gen/min_base.css'
    ),
    'auth_style' : Bundle(
        '../../../assets/styles/auth.less',
        depends=[
            '../../../assets/styles/manager/usgs_header_footer.less'
        ],
        filters='less,cssmin',
        output='gen/auth_style.css'
    ),
    'manager_style' : Bundle(
        '../../../assets/styles/manager/manager_custom.less',
        depends=[
            '../../../assets/styles/manager/usgs_header_footer.less',
            '../../../assets/styles/manager/manage_publications.less',
            '../../../assets/styles/manager/publication.less',
            '../../../assets/styles/manager/bibliodata.less',
            '../../../assets/styles/manager/links.less',
            '../../../assets/styles/manager/contributors.less',
            '../../../assets/styles/manager/spn.less',
            '../../../assets/styles/manager/cataloging.less',
            '../../../assets/styles/manager/geospatial.less',
            '../../../assets/styles/manager/editSeriesTitle.less',
            '../../../assets/styles/manager/manageContributors.less',
            '../../../assets/styles/manager/manageAffiliations.less'
        ],
        filters='less,cssmin',
        output='gen/manager_style.css'
    ),
    'metrics_style' : Bundle(
        '../../../assets/styles/metrics/metrics_custom.less',
        depends=[
            '../../../assets/styles/manager/usgs_header_footer.less',
        ],
        filters='less,cssmin',
        output='gen/metrics_style.css'
    ),
}

assets = Environment(app)
assets.register(bundles)
