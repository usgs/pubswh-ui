import 'select2';

import extend from 'lodash/extend';
import has from 'lodash/has';

import * as DynamicSelect2 from '../utils/DynamicSelect2';
import { createDivInContainer } from '../utils/jqueryUtils';
import BaseView from './BaseView';
import AlertView from './AlertView';
import EditPersonView from './EditPersonView';
import EditCorporationView from './EditCorporationView';
import hbTemplate from '../hb_templates/manageContributors.hbs';


const DEFAULT_SELECT2_OPTIONS = {
    theme : 'bootstrap'
};


/*
 * @constructs
 * @param {Object} options
 *      @prop {Jquery selector} el
 *      @prop {ContributorModel} model
 *      @prop {Backbone.Router} router
 */
export default BaseView.extend({
    template: hbTemplate,

    events: {
        'click .back-to-search-btn' : 'goToSearchPage',
        'select2:select .contributor-type-select': 'selectContributorType',
        'click .create-btn' : 'createContributor',
        'select2:select .select-contributor-to-update-container select' : 'editContributor',
        'click .save-btn' : 'saveContributor',
        'click .cancel-btn' : 'restoreSavedValues',
        'click .create-new-btn' : 'resetContributorView'
    },

    initialize : function() {
        BaseView.prototype.initialize.apply(this, arguments);
        if (!this.model.isNew()) {
            this.initialFetchPromise = this.model.fetch();
        }
        this.alertView = new AlertView({
            el : '.alert-container'
        });
    },

    render : function() {
        var self = this;
        var $loadingIndicator;
        BaseView.prototype.render.apply(this, arguments);

        // If fetching an existing contributor, create edit view once the contributor has been fetched.
        if (has(this, 'initialFetchPromise')) {
            $loadingIndicator = this.$('.loading-indicator');
            $loadingIndicator.show();
            this.initialFetchPromise
            .done(function() {
                self._createContributorView();
            })
            .fail(function(jqXHR) {
                self.alertView.showDangerAlert('Unable to fetch contributor. ' +
                    'Service returned status ' + jqXHR.status + ' with error ' + jqXHR.statusText);
            })
            .always(function() {
                $loadingIndicator.hide();
            });
        } else {
            this.$('.select-contributor-container').show();
        }

        this.alertView.setElement('.alert-container');
        // Initialize the select2's
        this.$('.contributor-type-select').select2(DEFAULT_SELECT2_OPTIONS);
        this.$('.person-select-div select').select2(DynamicSelect2.getSelectOptions({
            lookupType : 'people',
            subgroups: {
                queryParameter: 'preferred',
                nameAndValues: [{
                    name: 'Preferred',
                    value: 'true'
                }, {
                    name: 'Not preferred',
                    value: 'false'
                }]
            }
        }, extend({minimumInputLength : 2}, DEFAULT_SELECT2_OPTIONS)));
        this.$('.corporation-select-div select').select2(DynamicSelect2.getSelectOptions({
            lookupType : 'corporations',
            subgroups: {
                queryParameter: 'preferred',
                nameAndValues: [{
                    name: 'Preferred',
                    value: 'true'
                }, {
                    name: 'Not preferred',
                    value: 'false'
                }]
            }
        }, DEFAULT_SELECT2_OPTIONS));

        return this;
    },

    remove : function() {
        this.alertView.remove();
        if (this.editContributorView) {
            this.editContributorView.remove();
        }
        BaseView.prototype.remove.apply(this, arguments);
    },

    /*
     * Helper function to create an edit contributor view.
     */
     _createContributorView : function() {
        var EditView = this.model.has('corporation') && this.model.get('corporation') ? EditCorporationView : EditPersonView;
        this.$('.select-contributor-container').hide();
        this.$('.contributor-button-container').show();
        this.editContributorView = new EditView({
            el : createDivInContainer(this.$('.edit-contributor-container')),
            model : this.model
        });
        this.editContributorView.render();
    },

    /*
     * DOM event handlers
     */

    goToSearchPage : function(ev) {
        ev.preventDefault();
        this.router.navigate('', {trigger: true});
    },

    selectContributorType : function(ev) {
        var type = ev.currentTarget.value;
        var $personSelectDiv = this.$('.person-select-div');
        var $corpSelectDiv = this.$('.corporation-select-div');
        this.$('.select-create-or-edit-container').show();
        switch(type) {
            case 'person':
            $personSelectDiv.show();
            $corpSelectDiv.hide();
            break;

            case 'corporation':
            $personSelectDiv.hide();
            $corpSelectDiv.show();
            break;
        }
    },

    createContributor : function() {
        var contributorType = this.$('.contributor-type-select').val();

        this.model.set('corporation', contributorType === 'corporation' ? true : false);
        this._createContributorView();
    },

    editContributor : function(ev) {
        var self = this;
        var contributorType = this.$('.contributor-type-select').val();
        var contributorId = ev.currentTarget.value;
        var $loadingIndicator = this.$('.loadingIndicator');

        $loadingIndicator.show();
        this.model.set({
            contributorId: contributorId,
            corporation: contributorType === 'corporation' ? true : false
        });
        this.model.fetch()
        .done(function() {
            self._createContributorView();
            self.router.navigate('contributor/' + contributorId);
        })
        .fail(function(jqXHR) {
            self.alertView.showDangerAlert('Unable to fetch contributor. ' +
                'Service returned status ' + jqXHR.status + ' with error ' + jqXHR.statusText);
        })
        .always(function() {
            $loadingIndicator.hide();
        });
        this.router.navigate('contributor/' + contributorId);
    },

    saveContributor : function() {
        var self = this;
        var $loadingIndicator = this.$('.loadingIndicator');
        var $errorDiv = this.$('.validation-errors');

        $loadingIndicator.show();
        $errorDiv.html('');
        this.model.save()
        .done(function() {
            self.alertView.showSuccessAlert('Contributor successfully saved');
            self.router.navigate('contributor/' + self.model.get('contributorId'));
        })
        .fail(function(jqXHR) {
            self.alertView.showDangerAlert('Unable to save contributor.');
            if (jqXHR.responseJSON && jqXHR.responseJSON.validationErrors) {
                $errorDiv.html('<pre>' + JSON.stringify(jqXHR.responseJSON.validationErrors) + '</pre>');
            }
        })
        .always(function() {
            $loadingIndicator.hide();
        });
    },

    restoreSavedValues : function() {
        var self = this;
        var modelId = this.model.get('contributorId');

        this.model.clear();
        if (modelId) {
            this.model.set('contributorId', modelId);
            this.model.fetch().fail(function () {
                self.alertView.showDangerAlert('Failed to fetch contributor');
            });
        }
    },

    resetContributorView : function() {
        this.editContributorView.remove();
        this.model.clear();
        this.alertView.closeAlert();
        this.$('select').val('').trigger('change');
        this.$('.select-contributor-container').show();
        this.$('.contributor-button-container').hide();

        this.router.navigate('contributor');
    }
});
