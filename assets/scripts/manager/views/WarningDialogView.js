define([
    'bootstrap',
    'views/BaseView',
    'hbs!hb_templates/warningDialog'
], function(bootstrap, BaseView, hbTemplate) {
        var view = BaseView.extend({
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

    return view;
});
