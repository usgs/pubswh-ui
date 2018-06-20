import 'backbone.stickit';

import BaseView from './BaseView';
import hbTemplate from '../hb_templates/editCorporation.hbs';


/*
 * @constructs
 * @param {Object} options
 *      @prop {Jquery selector} el
 *      @prop {ContributorModel} model
 */
export default BaseView.extend({
    template : hbTemplate,

    bindings : {
        '#organization' : 'organization'
    },

    render : function() {
        BaseView.prototype.render.apply(this, arguments);
        this.stickit();
        return this;
    }
});
