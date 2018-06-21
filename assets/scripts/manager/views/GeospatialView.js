import 'backbone.stickit';

import BaseView from './BaseView';
import hb_template from '../hb_templates/geospatial.hbs';


export default BaseView.extend({
    template : hb_template,

    bindings : {
        '#country-input' : 'country',
        '#state-input' : 'state',
        '#county-input' : 'county',
        '#city-input' : 'city',
        '#otherGeospatial-input' : 'otherGeospatial',
        '#geographicExtents-input' : 'geographicExtents'
    },

    render : function() {
        BaseView.prototype.render.apply(this, arguments);
        this.stickit();
        return this;
    }
});
