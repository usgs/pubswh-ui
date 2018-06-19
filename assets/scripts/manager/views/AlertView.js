define([
    './BaseView',
    '../hb_templates/alert.hbs'
], function(BaseView, hbTemplate) {
        var view = BaseView.extend({

        ALERT_KINDS : {
            success : 'alert-success',
            info : 'alert-info',
            warning : 'alert-warning',
            danger : 'alert-danger'
        },

        template: hbTemplate,

        /*
         * @params {String} el - jquery selector where to render the alert
         */
        initialize : function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.context.alertKind = '';
            this.context.message = '';
        },

        showAlert : function(kind, message) {
            if (this.$('.alert').length === 0) {
                this.context.alertKind = kind;
                this.context.message = message;
                this.render();
            } else {
                this.$('.alert').removeClass(this.context.alertKind).addClass(kind);
                this.$('.alert-message').html(message);

                this.context.alertKind = kind;
                this.context.message = message;
            }
        },

        /*
         * The following four functions make the alert window visible for the indicated alert kind.
         * @param {String} message - Message shown in alert window.
         */
        showSuccessAlert : function(message) {
            this.showAlert(this.ALERT_KINDS.success, message);
        },
        showInfoAlert : function(message) {
            this.showAlert(this.ALERT_KINDS.info, message);
        },
        showWarningAlert : function(message) {
            this.showAlert(this.ALERT_KINDS.warning, message);
        },
        showDangerAlert : function(message) {
            this.showAlert(this.ALERT_KINDS.danger, message);
        },
        closeAlert : function() {
            if (this.$('.alert').length > 0) {
                this.$el.html('');
            }
        }
    });

    return view;
});
