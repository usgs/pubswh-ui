import 'select2';
import 'backbone.stickit';

import _ from 'underscore';

import BaseView from './BaseView';
import hbTemplate from '../hb_templates/linkRow.hbs';


export default BaseView.extend({

    events: {
        'select2:select .link-type': 'selectLinkType',
        'select2:unselect .link-type': 'resetLinkType',
        'select2:select .link-file-type': 'selectLinkFileType',
        'select2:unselect .link-file-type': 'resetLinkFileType',
        'click .delete-row' : 'deleteRow',
        'updateOrder .link-row-container' : 'updateLinksOrder' // This event is generated when the row position in the parent is changed
    },

    bindings: {
        '.link-text': 'text',
        '.link-file-size': 'size',
        '.link-description': 'description',
        '.link-url': 'url',
        '.link-help': 'linkHelpText'
    },

    template: hbTemplate,

    /*
     * @params {Object} options
     *     @prop {LinkModel} model
     *     @prop {LinkCollection} - collection which contains model.
     *     @prop {String} el - jquery selector for element where the view will be appended
     *     @prop {Collection of LookupModels} linkTypeCollection - this should contain data before render is called.
     *     @prop {Collection of LookupModels} linkFileTypeCollection - this should contain data before render is called.
     */
    initialize: function (options) {
        BaseView.prototype.initialize.apply(this, arguments);

        this.linkTypeCollection = options.linkTypeCollection;
        this.linkFileTypeCollection = options.linkFileTypeCollection;

        // Add binding from model to dom for select2's
        this.listenTo(this.model, 'change:type', this.updateLinkType);
        this.listenTo(this.model, 'change:linkFileType', this.updateLinkFileType);
    },

    render: function () {
        var self = this;
        BaseView.prototype.render.apply(this, arguments);
        // Sets up the binding between DOM elements and the model //
        this.stickit();

        // Initialize select2's
        this.$('.link-type').select2({
            allowClear: true,
            theme: 'bootstrap',
            data: self.linkTypeCollection.toJSON()
        });
        this.updateLinkType();


        this.$('.link-file-type').select2({
            allowClear: true,
            theme: 'bootstrap',
            data: self.linkFileTypeCollection.toJSON()
        });
        this.updateLinkFileType();

        return this;
    },

    /*
     * Event handlers for select and reset events for the select2's
     */


    selectLinkType: function (ev) {
        this.model.set('type', {
            id: ev.currentTarget.value,
            text: ev.currentTarget.selectedOptions[0].innerHTML
        });
    },

    resetLinkType: function () {
        this.model.unset('type');
    },

    selectLinkFileType: function (ev) {
        this.model.set('linkFileType', {
            id: ev.currentTarget.value,
            text: ev.currentTarget.selectedOptions[0].innerHTML
        });
    },

    resetLinkFileType: function () {
        this.model.unset('linkFileType');
    },

    /*
     * Remove the model from the collection
     */
    deleteRow : function() {
        this.collection.remove(this.model);
    },


    /*
     * Update the model's rank in the collection to reflect the new position.
     */
    updateLinksOrder : function(ev, newIndex) {
        this.collection.updateModelRank(this.model, newIndex + 1);
    },

    /*
     * Model attribute change handlers for select2's
     */
    updateLinkType : function() {
        var $select = this.$('.link-type');
        var linkType = this.model.get('type');

        if (_.has(linkType, 'id')) {
            $select.val(linkType.id).trigger('change');
        } else {
            $select.val('').trigger('change');
        }
    },

    updateLinkFileType : function() {
        var $select = this.$('.link-file-type');
        var linkFileType = this.model.get('linkFileType');

        if (_.has(linkFileType, 'id')) {
            $select.val(linkFileType.id).trigger('change');
        } else {
            $select.val('').trigger('change');
        }
    }
});
