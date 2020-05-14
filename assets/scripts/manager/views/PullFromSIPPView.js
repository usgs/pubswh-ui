import has from 'lodash/has';
import isArray from 'lodash/isArray';

import BaseView from './BaseView';
import AlertView from './AlertView';
import hbTemplate from '../hb_templates/pullFromSIPP.hbs';

const URL = window.CONFIG.scriptRoot + '/manager/services/mppublications/sipp';

/*
 * @constructs
 * @param {Object} options
 *      @prop {Jquery selector} el
 *      @prop {Backbone.Router} router
 */
export default BaseView.extend({
    template: hbTemplate,

    events: {
        'click .back-to-search-btn' : 'goToSearchPage',
        'click .pull-from-sipp-btn': 'pullIPNumberFromSIPP'
    },

    initialize: function() {
        BaseView.prototype.initialize.apply(this, arguments);
        this.alertView = new AlertView({
            el : '.alert-container'
        });
    },

    render: function() {
        BaseView.prototype.render.apply(this, arguments);
        this.$('.loading-indicator').hide();
        this.alertView.setElement('.alert-container');
        return this;
    },

    remove: function() {
        this.alertView.remove();
        BaseView.prototype.remove.apply(this, arguments);
    },

    goToSearchPage: function(ev) {
        ev.preventDefault();
        this.router.navigate('', {trigger: true});
    },

    pullIPNumberFromSIPP: function() {
        let self = this;
        const ipNumber = this.$('#ip-number').val();
        const $loadingIndicator = this.$('.loading-indicator');
        $loadingIndicator.show();
        $.ajax({
            url: URL,
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            contentType: 'application/json',
            processData: false,
            data: '{"IPNumber": "' + ipNumber + '",   "ProcessType": "DISSEMINATION"}',
            success: function() {
                self.alertView.showSuccessAlert('Successfully pulled publication from SIPP');
            },
            error: function(jqXHR) {
                var resp = jqXHR.responseJSON;
                if (has(resp, 'Error Message')) {
                    self.alertView.showDangerAlert(resp['Error Message']);
                } else if (has(resp, 'validationErrors') &&
                        isArray(resp.validationErrors) &&
                        resp.validationErrors.length > 0) {
                    self.alertView.showDangerAlert(JSON.stringify(resp.validationErrors));
                } else {
                    self.alertView.showDangerAlert('Can\'t retrieve the publication: ' + jqXHR.statusText);
                }
            },
            complete: function() {
                $loadingIndicator.hide();
            }
        });
    }
});