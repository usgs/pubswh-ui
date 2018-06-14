

from flask_assets import Environment, Bundle

from . import app

base_metrics_js = Bundle(
    'metrics/js/analyticsData.js',
    'metrics/js/analyticsGraph.js',
    'metrics/js/dataUtils.js',
)
bundles={
}

assets = Environment(app)
assets.register(bundles)
