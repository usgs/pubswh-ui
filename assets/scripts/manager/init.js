require('./vendor-globals');
require('jquery-ui');
require('jquery-ui/ui/widgets/mouse');
require('jquery-ui/ui/widgets/sortable');
require('bootstrap');

const Backbone = require('backbone');
Backbone.$ = $;

const log = require('loglevel');
const AppRouter = require('./controller/AppRouter');

const config = window.CONFIG;

if (config.jsDebug) {
    log.setLevel('debug', false);
} else {
    log.setLevel('warn', false);
}

new AppRouter();
Backbone.history.start({
    root: config.scriptRoot + '/manager/'
});
