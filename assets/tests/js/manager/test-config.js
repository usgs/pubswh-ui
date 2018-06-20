window.CONFIG = {
    lookupUrl: 'test_lookup/',
    scriptRoot: ''
    //jsDebug: true,
    //oldMyPubsEndpoint: '',
    //previewUrl: ''
};

require('../../../scripts/manager/vendor-globals');
require('jquery-ui');
require('bootstrap');

const Backbone = require('backbone');
Backbone.$ = $;
