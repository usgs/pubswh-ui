import 'backbone.stickit';
import 'select2';

import $ from 'jquery';
import clone from 'lodash/clone';
import extend from 'lodash/extend';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import reject from 'lodash/reject';

import CostCenterCollection from '../models/CostCenterCollection';
import OutsideAffiliationLookupCollection from '../models/OutsideAffiliationLookupCollection';
import BaseView from './BaseView';
import hbTemplate from '../hb_templates/editPerson.hbs';


var DEFAULT_SELECT2_OPTIONS = {
    allowClear : true,
    theme : 'bootstrap'
};


/*
 * @constructs
 * @param {Object} options
 *      @prop {Jquery selector} el
 *      @prop {ContributorModel} model
 */
 export default BaseView.extend({
    template : hbTemplate,

    events : {
        'select2:select .affiliation-select-div select' : 'selectAffiliations',
        'select2:unselect .affiliation-select-div select' : 'unselectAffiliations'
    },

    bindings : {
        '#first-name' : 'given',
        '#last-name' : 'family',
        '#suffix' : 'suffix',
        '#email' : 'email',
        '#orcid-id' : 'orcid',
        '#is-usgs' : 'usgs',
        '#preferred': 'preferred'
    },

    initialize : function() {
        BaseView.prototype.initialize.apply(this, arguments);

        this.activeCostCenters = new CostCenterCollection();
        this.notActiveCostCenters = new CostCenterCollection();
        this.costCenterPromise = $.when(
            this.activeCostCenters.fetch({data : {active : true}}),
            this.notActiveCostCenters.fetch({data : {active : false}})
            );

        this.activeOutsideAffiliates = new OutsideAffiliationLookupCollection();
        this.notActiveOutsideAffiliates = new OutsideAffiliationLookupCollection();
        this.outsideAffiliatesPromise = $.when(
            this.activeOutsideAffiliates.fetch({data : {active : true}}),
            this.notActiveOutsideAffiliates.fetch({data : {active : false}})
            );

        // Add binding to dom for select2
        this.listenTo(this.model, 'change:affiliation', this.updateAffiliations);
    },

    render : function() {
        var self = this;
        BaseView.prototype.render.apply(this, arguments);

        this.stickit();

        var outsideData;
        var costCenterData;
        this.outsideAffiliatesPromise.done(function() {
            outsideData = {
                data: [{
                    text: 'Active -- Outside',
                    children: self.activeOutsideAffiliates.toJSON()
                }, {
                    text: 'Inactive -- Outside',
                    children: self.notActiveOutsideAffiliates.toJSON()
                }]
            };
        });
        this.costCenterPromise.done(function() {
            costCenterData = {
                data: [{
                    text: 'Active -- USGS',
                    children: self.activeCostCenters.toJSON()
                }, {
                    text: 'Inactive -- USGS',
                    children: self.notActiveCostCenters.toJSON()
                }]
            };
        });
        $.when(this.outsideAffiliatesPromise, this.costCenterPromise).done(function() {
            var costCenterDataArr = costCenterData.data;
            var outsideDataArr = outsideData.data;
            var allOptions = flatten([costCenterDataArr, outsideDataArr]);
            var allOptionsChoices = {data: allOptions};
            self.$('.all-affiliation-select').select2(extend(allOptionsChoices, DEFAULT_SELECT2_OPTIONS));
            self.updateAffiliations();
        });

        return this;
    },

    /*
     * Model event handlers
     */

    updateAffiliations : function() {
        var $allAffiliationsSelect = this.$('.all-affiliation-select');
        var personAffiliations = this.model.get('affiliations');
        if (isEmpty(personAffiliations)) {
            $allAffiliationsSelect.val('').trigger('change');
        } else {
            $allAffiliationsSelect.val(map(personAffiliations, 'id')).trigger('change');
        }
    },

    /*
     * DOM event handlers
     */

    selectAffiliations : function(ev) {
        var selectedAffiliations;
        if (this.model.has('affiliations')) {
            selectedAffiliations = clone(this.model.get('affiliations'));
        } else {
            selectedAffiliations = [];
        }
        selectedAffiliations.push({
            id : parseInt(ev.params.data.id),
            text : ev.params.data.text
        });
        this.model.set('affiliations', selectedAffiliations);
    },

    unselectAffiliations : function(ev) {
        var selectedAffiliations = clone(this.model.get('affiliations'));
        var terminalAffiliation = parseInt(ev.params.data.id);
        var paredDownAffiliations = reject(selectedAffiliations, function(sa) {
            return sa.id === terminalAffiliation;
        });
        this.model.set('affiliations', paredDownAffiliations);
    }
});
