import 'jquery-ui';
import 'jquery-ui/ui/widgets/mouse';
import 'jquery-ui/ui/widgets/sortable';
import 'bootstrap';

import Backbone from 'backbone';

import log from 'loglevel';
import AppRouter from './controller/AppRouter';

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
