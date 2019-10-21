import 'select2';
import 'backbone.stickit';

import extend from 'lodash/extend';

import * as DynamicSelect2 from '../utils/DynamicSelect2';
import PublicationSubtypeCollection from '../models/PublicationSubtypeCollection';
import BaseView from './BaseView';
import AlertView from './AlertView';
import hbTemplate from '../hb_templates/editSeriesTitle.hbs';


const DEFAULT_SELECT2_OPTIONS = {
    theme : 'bootstrap'
};

const ALERT_CONTAINER_SEL = '.alert-container';
const LOADING_INDICATOR_SEL = '.loading-indicator';
const ERRORS_SEL = '.validation-errors';
const CREATE_OR_EDIT_DIV = '.create-or-edit-div';
const EDIT_DIV = '.edit-div';
const EDIT_PUB_SUBTYPE_INPUT_SEL = '#edit-pub-subtype-input';
const EDIT_SERIES_TITLE_INPUT_SEL = '#edit-series-title-input';
const PUB_SUBTYPE_INPUT_SEL = '#pub-subtype-input';
const DELETE_BUTTON_SEL = '.delete-btn';


/*
 * @construct
 * @param {Object} option
 *      @prop {SeriesTitleModel} model
 *      @prop {Jquery element or selector} el
 *      @prop {Backbone.Router} router
 */
export default BaseView.extend({

    events : {
        'click .back-to-search-btn' : 'goToSearchPage',
        'select2:select #edit-pub-subtype-input' : 'enableEditSeriesTitleSelect',
        'select2:select #edit-series-title-input' : 'showEditSelectedSeriesTitle',
        'click .create-btn' : 'showCreateNewSeriesTitle',
        'select2:select #pub-subtype-input' : 'changePublicationSubtype',
        'click .save-btn' : 'saveSeriesTitle',
        'click .cancel-btn' : 'resetFields',
        'click .create-new-btn' : 'clearPage',
        'click .delete-ok-btn' : 'deleteSeriesTitle'
    },

    bindings : {
        '#series-title-text-input' : 'text',
        '#series-doi-name-input' : 'seriesDoiName',
        '#online-issn-input' : 'onlineIssn',
        '#print-issn-input' : 'printIssn',
        '#active-input' : 'active'
    },

    template : hbTemplate,

    initialize : function() {
        BaseView.prototype.initialize.apply(this, arguments);
        if (!this.model.isNew()) {
            this.model.fetch();
        }

        // Create child views
        this.alertView = new AlertView({
            el : ALERT_CONTAINER_SEL
        });

        //Retrieve lookup for publication subtype
        this.publicationSubtypeCollection = new PublicationSubtypeCollection();
        this.pubSubtypePromise = this.publicationSubtypeCollection.fetch();

        this.listenTo(this.model, 'change:publicationSubtype', this.updatePublicationSubtype);
    },

    render : function() {
        const self = this;
        this.context = this.model.attributes;
        BaseView.prototype.render.apply(this, arguments);
        this.stickit();

        this.alertView.setElement(this.$(ALERT_CONTAINER_SEL));

        this.$(EDIT_SERIES_TITLE_INPUT_SEL).select2(DynamicSelect2.getSelectOptions({
            lookupType : 'publicationseries',
            parentId : 'publicationsubtypeid',
            getParentId : function() {
                return self.$(EDIT_PUB_SUBTYPE_INPUT_SEL).val();
            },
            subgroups : {
                queryParameter: 'active',
                nameAndValues: [{
                    name: 'Active',
                    value: true
                }, {
                    name: 'Not Active',
                    value: false
                }]
            }
        }, DEFAULT_SELECT2_OPTIONS));
        this.pubSubtypePromise.done(function() {
            const select2Options = extend({
                data : [{id : ''}].concat(self.publicationSubtypeCollection.toJSON())
            }, DEFAULT_SELECT2_OPTIONS);
            self.$(EDIT_PUB_SUBTYPE_INPUT_SEL).select2(select2Options);
            self.$(PUB_SUBTYPE_INPUT_SEL).select2(select2Options);
            self.updatePublicationSubtype();
        });

        return this;
    },

    remove : function() {
        this.alertView.remove();
        BaseView.prototype.remove.apply(this, arguments);
        return this;
    },

    /*
     * Model event handlers
     */

    updatePublicationSubtype : function() {
        const $select = this.$(PUB_SUBTYPE_INPUT_SEL);
        let subtype;
        if (this.model.has('publicationSubtype')) {
            subtype = this.model.get('publicationSubtype');
            $select.val(subtype.id).trigger('change');
        } else {
            $select.val('').trigger('change');
        }
    },

    /*
     * Helper methods. Used by various DOM event handlers
     */
    showEditSection : function() {
        this.$(EDIT_DIV).removeClass('hidden').addClass('show');
        this.$(CREATE_OR_EDIT_DIV).removeClass('show').addClass('hidden');
    },

    hideEditSection : function() {
        this.$(EDIT_PUB_SUBTYPE_INPUT_SEL).val('').trigger('change');
        this.$(EDIT_SERIES_TITLE_INPUT_SEL).prop('disabled', true).val('').trigger('change');

        this.$(EDIT_DIV).removeClass('show').addClass('hidden');
        this.$(CREATE_OR_EDIT_DIV).removeClass('hidden').addClass('show');

        this.alertView.closeAlert();
        this.$(ERRORS_SEL).html('');
    },
    /*
     * DOM event handlers
     */

    goToSearchPage : function() {
        this.router.navigate('', {trigger : true});
    },

    enableEditSeriesTitleSelect : function(){
        this.$(EDIT_SERIES_TITLE_INPUT_SEL).prop('disabled', false);
    },

    showEditSelectedSeriesTitle : function(ev) {
        const self = this;
        const seriesId = ev.currentTarget.value;
        const seriesTitle = ev.currentTarget.selectedOptions[0].innerHTML;
        const $loadingIndicator = this.$(LOADING_INDICATOR_SEL);

        $loadingIndicator.show();
        this.alertView.closeAlert();

        this.model.set('id', seriesId);
        this.model.fetch()
            .done(function() {
                self.$(DELETE_BUTTON_SEL).prop('disabled', false);
                self.showEditSection();
                self.router.navigate('seriesTitle/' + seriesId);
            })
            .fail(function() {
                self.alertView.showDangerAlert('Failed to fetch series title,  ' + seriesTitle);
            })
            .always(function() {
                $loadingIndicator.hide();
            });
    },

    showCreateNewSeriesTitle : function() {
        this.$(DELETE_BUTTON_SEL).prop('disabled', true);
        this.showEditSection();
    },

    changePublicationSubtype : function(ev) {
        this.model.set('publicationSubtype', {id : ev.currentTarget.value});
    },

    saveSeriesTitle : function() {
        const self = this;
        const $loadingIndicator = this.$(LOADING_INDICATOR_SEL);
        const $errorDiv = this.$(ERRORS_SEL);

        $loadingIndicator.show();
        $errorDiv.html('');
        this.model.save()
            .done(function() {
                self.alertView.showSuccessAlert('Successfully saved the series title');
                self.$(DELETE_BUTTON_SEL).prop('disabled', false);
                self.router.navigate('seriesTitle/' + self.model.get('id'));
            })
            .fail(function(jqxhr) {
                self.alertView.showDangerAlert('Unable to save the series title');
                if (jqxhr.responseJSON && jqxhr.responseJSON.validationErrors) {
                    $errorDiv.html('<pre>' + JSON.stringify(jqxhr.responseJSON.validationErrors) + '</pre>');
                }
            })
            .always(function() {
                $loadingIndicator.hide();
            });
    },
    resetFields : function() {
        const self = this;
        const modelId = this.model.get('id');
        this.model.clear();
        this.model.set('id', modelId);
        this.model.fetch()
            .fail(function() {
                self.alertView.showDangerAlert('Failed to fetch series title');
            });
    },

    clearPage : function() {
        this.hideEditSection();
        this.model.clear();
        this.router.navigate('seriesTitle');
    },

    deleteSeriesTitle : function() {
        const self = this;
        const seriesTitle = this.model.get('text');
        const $loadingIndicator = this.$(LOADING_INDICATOR_SEL);
        $loadingIndicator.show();
        this.model.destroy({wait : true})
            .done(function() {
                self.router.navigate('seriesTitle');
                self.hideEditSection();
                self.alertView.showSuccessAlert('Successfully deleted series title ' + seriesTitle + '.');
            })
            .fail(function(jqXHR) {
                self.alertView.showDangerAlert('Unable to delete series title: ' + jqXHR.responseText);
            })
            .always(function() {
                $loadingIndicator.hide();
            });
    }
});
