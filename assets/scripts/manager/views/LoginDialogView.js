import $ from 'jquery';
import has from 'lodash/has';
import isFunction from 'lodash/isFunction';
import omit from 'lodash/omit';

import BaseView from './BaseView';
import hbTemplate from '../hb_templates/loginDialog.hbs';


export default BaseView.extend({
    template : hbTemplate,

    events : {
        'click .submit-btn' : 'verifyCredentials',
        'submit form' : 'verifyCredentials',
        'click .cancel-btn' : 'close'
    },

    render : function() {
        BaseView.prototype.render.apply(this, arguments);
        this.$('.modal').modal({
            show : false
        });
    },

    /*
     * Show the login dialog.
     * @param {Function} loginFnc (optional) - A parameterless function which will be executed when a user tries to log in.
     */
    show : function(loginFnc) {
        if (isFunction(loginFnc)) {
            this.loginFnc = loginFnc;
        }
        this.$('.modal').modal('show');
    },

    verifyCredentials : function(ev) {
        var self = this;
        var data = this.$('form').serialize();

        ev.preventDefault();

        $.ajax({
            url : window.CONFIG.scriptRoot + '/loginservice/',
            method : 'POST',
            data : data,
            success : function() {
                if (has(self, 'loginFnc')) {
                    self.loginFnc();
                }
                self.close();
            },
            error : function(jqXHR, textStatus) {
                self.$('.login-errors').html('Unable to log in with error: ' + textStatus +
                    '<br/>Please try again');
            }
        });
    },

    close : function() {
        this.$('.modal').modal('hide');
        this.$('.login-errors').html('');
        this.$('input').val('');

        omit(this, 'loginFnc');
    }
});
