window.CONFIG = {
    lookupUrl: 'test_lookup/',
    scriptRoot: ''
    //jsDebug: true,
    //oldMyPubsEndpoint: '',
    //previewUrl: ''
};

require('../../../scripts/manager/vendor-globals');
require('jquery-ui');
require('jquery-ui/ui/widgets/mouse');
require('jquery-ui/ui/widgets/sortable');
require('bootstrap');

const Backbone = require('backbone');
Backbone.$ = $;
