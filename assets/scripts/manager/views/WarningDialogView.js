import BaseView from './BaseView';
import hbTemplate from '../hb_templates/warningDialog.hbs';


export default BaseView.extend({
    template : hbTemplate,

    events : {
        'click .ok-btn': 'closeDialog'
    },

    render : function() {
        BaseView.prototype.render.apply(this, arguments);
        this.$('.modal').modal({
            show : false
        });
        return this;
    },

    /*
     * @param {String} title
     * @param {String} message
     */
    show : function(title, message) {
        this.$('.modal-title').html(title);
        this.$('.modal-body').html(message);
        this.$('.modal').modal('show');
    },

    closeDialog : function() {
        this.$('.modal').modal('hide');
    }
});
