import 'backbone.stickit';

import $ from 'jquery';
import extend from 'lodash/extend';

import BaseView from './BaseView';
import AlertView from './AlertView';
import CostCenterCollection from '../models/CostCenterCollection';
import OutsideAffiliationCollection from '../models/OutsideAffiliationLookupCollection';
import hbTemplate from '../hb_templates/manageAffiliations.hbs';


const DEFAULT_SELECT2_OPTIONS = {
    allowClear : true,
    theme : 'bootstrap'
};
const EDIT_DIV = '.edit-div';
const CREATE_OR_EDIT_DIV = '.select-create-or-edit-container';
const SELECT_TYPE_DIV = '.select-affiliation-type';
const AFFILIATION_TYPE_INPUT_SEL = '#edit-affiliation-type-input';
const CC_AFFILIATION_INPUT_SEL = '#cost-center-edit-affiliation-input';
const OA_AFFILIATION_INPUT_SEL = '#outside-edit-affiliation-input';
const LOADING_INDICATOR_SEL = '.loading-indicator';
const ERRORS_SEL = '.validation-errors';
const DELETE_BUTTON_SEL = '.delete-btn';
const ALERT_CONTAINER_SEL = '.alert-container';
const CREATE_EDIT_CONTAINER = '.select-create-or-edit-container';
const COST_CENTER_INPUT_DIV = '#cost-center-input-div';
const OUTSIDE_AFFILIATION_INPUT_DIV = '#outside-affiliation-input-div';


export default BaseView.extend({

    template : hbTemplate,

    events : {
        'click .save-btn' : 'saveAffiliation',
        'click .create-btn' : 'showCreateNewAffiliation',
        'click .cancel-btn' : 'resetFields',
        'click .delete-ok-btn' : 'deleteAffiliation',
        'click .create-new-btn' : 'clearPage',
        'select2:select #edit-affiliation-type-input' : 'enableAffiliationSelect',
        'select2:select #cost-center-edit-affiliation-input' : 'showEditSelectedAffiliation',
        'select2:select #outside-edit-affiliation-input' : 'showEditSelectedAffiliation'
    },

    bindings : {
        '#affiliation-input' : 'text',
        '#affiliation-active-input' : 'active'
    },

    initialize : function() {
        BaseView.prototype.initialize.apply(this, arguments);

        // Create child views
        this.alertView = new AlertView({
            el : ALERT_CONTAINER_SEL
        });
        // Cost Center identification attribute
        this.affiliationIsCostCenter = null;
        this.activeCostCenters = new CostCenterCollection();
        this.inactiveCostCenters = new CostCenterCollection();
        this.costCenterPromise = $.when(
            this.activeCostCenters.fetch({data : {active : true}}),
            this.inactiveCostCenters.fetch({data : {active : false}})
        );
        this.activeOutsideAffiliates = new OutsideAffiliationCollection();
        this.inactiveOutsideAffiliates = new OutsideAffiliationCollection();
        this.outsideAffiliatesPromise = $.when(
            this.activeOutsideAffiliates.fetch({data : {active : true}}),
            this.inactiveOutsideAffiliates.fetch({data : {active : false}})
        );
    },

    render : function() {
        var self = this;
        BaseView.prototype.render.apply(self, arguments);
        this.stickit();
        this.alertView.setElement(this.$(ALERT_CONTAINER_SEL));
        self.$(AFFILIATION_TYPE_INPUT_SEL).select2({}, DEFAULT_SELECT2_OPTIONS);
    },

    _isCostCenterSelected : function() {
        var isCostCenter;
        var affiliationTypeValue = this.$(AFFILIATION_TYPE_INPUT_SEL).val();
        if (affiliationTypeValue == 1 ) {
            isCostCenter = true;
        } else if (affiliationTypeValue == 2 ) {
            isCostCenter = false;
        } else {
            isCostCenter = null;
        }
        return isCostCenter;
    },

    showEditSection : function() {
        this.$(EDIT_DIV).show();
        this.$(CREATE_OR_EDIT_DIV).hide();
        this.$(SELECT_TYPE_DIV).hide();
    },

    hideEditSection : function() {
        this.$(SELECT_TYPE_DIV).show();
        // reset initial affiliation select values
        this.$(AFFILIATION_TYPE_INPUT_SEL).val('').trigger('change');
        // hide edit fields
        this.$(EDIT_DIV).hide();

        this.alertView.closeAlert();
        this.$(ERRORS_SEL).html('');
    },

    enableAffiliationSelect : function() {
        var self = this;
        this.$(CREATE_EDIT_CONTAINER).show();
        this.affiliationIsCostCenter = this._isCostCenterSelected();
        if (this.affiliationIsCostCenter) {
            this.costCenterPromise.done(function() {
                self.$(CC_AFFILIATION_INPUT_SEL).select2(extend({
                    data : [{
                        text : 'Active',
                        children : self.activeCostCenters.toJSON()
                    }, {
                        text : 'Not Active',
                        children : self.inactiveCostCenters.toJSON()
                    }]
                }, DEFAULT_SELECT2_OPTIONS));
            });
            self.$(CC_AFFILIATION_INPUT_SEL).trigger('change');
            $.when(this.costCenterPromise).done(function() {
                self.$(CC_AFFILIATION_INPUT_SEL).val('').trigger('change');
                self.$(COST_CENTER_INPUT_DIV).show();
                self.$(OUTSIDE_AFFILIATION_INPUT_DIV).hide();
            });
        } else {
            this.outsideAffiliatesPromise.done(function() {
                self.$(OA_AFFILIATION_INPUT_SEL).select2(extend({
                    data : [{
                        text : 'Active',
                        children : self.activeOutsideAffiliates.toJSON()
                    }, {
                        text : 'Not Active',
                        children : self.inactiveOutsideAffiliates.toJSON()
                    }]
                }, DEFAULT_SELECT2_OPTIONS));
            });
            $.when(this.outsideAffiliatesPromise).done(function() {
                self.$(OA_AFFILIATION_INPUT_SEL).val('').trigger('change');
                self.$(COST_CENTER_INPUT_DIV).hide();
                self.$(OUTSIDE_AFFILIATION_INPUT_DIV).show();
            });
        }
    },

    showCreateNewAffiliation : function() {
        this.model.clear();
        this.$(DELETE_BUTTON_SEL).prop('disabled', true);
        this.showEditSection();
    },

    clearPage : function() {
        this.hideEditSection();
        this.model.clear();
        this.router.navigate('affiliation', {trigger : true});
    },

    resetFields : function() {
        var self = this;
        this.affiliationIsCostCenter = this._isCostCenterSelected();
        var modelId = this.model.get('id');
        this.model.clear();
        this.model.set('id', modelId);
        this.model.fetch({}, this.affiliationIsCostCenter)
            .fail(function() {
                self.alertView.showDangerAlert('Failed to fetch affiliation');
            });
    },

    showEditSelectedAffiliation : function(ev) {
        var self = this;
        var isCostCenter = this._isCostCenterSelected();
        var affiliationId = ev.currentTarget.value;
        var affiliationText = ev.currentTarget.selectedOptions[0].innerHTML;

        var $loadingIndicator = this.$(LOADING_INDICATOR_SEL);

        this.model.set('id', affiliationId);
        var fetchedModel = this.model.fetch({}, isCostCenter);
        fetchedModel.done(function() {
            self.showEditSection();
            self.router.navigate('affiliation/' + affiliationId);
        })
        .fail(function() {
            self.alertView.showDangerAlert('Failed to fetch affiliation ' + affiliationText + '.');
        })
        .always(function() {
            $loadingIndicator.hide();
        });
    },

    deleteAffiliation : function() {
        var self = this;
        var affiliationName = this.model.get('text');
        var $loadingIndicator = this.$(LOADING_INDICATOR_SEL);
        $loadingIndicator.show();
        // do not need to determine if affiliation is a cost center
        // a fetch needs to occur before a delete happens, so the cost center determination is done then
        this.model.destroy({wait : true}, this.affiliationIsCostCenter)
            .done(function() {
                self.router.navigate('affiliation');
                self.hideEditSection();
                self.alertView.showSuccessAlert('Successfully deleted affiliation: ' + affiliationName + '.');
            })
            .fail(function(jqxhr) {
                self.alertView.showDangerAlert('Unable to delete affiliation: ' + jqxhr.responseText);
            })
            .always(function() {
                $loadingIndicator.hide();
            });
    },

    saveAffiliation : function() {
        var self = this;
        var $loadingIndicator = this.$(LOADING_INDICATOR_SEL);
        var $errorDiv = this.$(ERRORS_SEL);

        $loadingIndicator.show();
        $errorDiv.html('');
        var affiliationName = this.model.get('text');
        this.model.save({}, {}, this.affiliationIsCostCenter)
            .done(function() {
                self.alertView.showSuccessAlert('Successfully saved the affiliation: ' + affiliationName + '.');
                self.$(DELETE_BUTTON_SEL).prop('disabled', false);
                self.router.navigate('affiliation/' + self.model.get('id'));
            })
            .fail(function(jqxhr) {
                self.alertView.showDangerAlert('Unable to save the affiliation.');
                if (jqxhr.responseJSON && jqxhr.responseJSON.validationErrors) {
                    $errorDiv.html('<pre>' + JSON.stringify(jqxhr.responseJSON.validationErrors) + '</pre>');
                }
            })
            .always(function() {
                $loadingIndicator.hide();
            });
    }
});
