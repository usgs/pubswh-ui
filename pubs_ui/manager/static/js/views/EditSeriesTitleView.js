/* jslint browser: true */
/* global define */

define([
	'select2',
	'backbone.stickit',
	'handlebars',
	'utils/DynamicSelect2',
	'views/BaseView',
	'views/AlertView',
	'hbs!hb_templates/editSeriesTitle'
], function(select2, stickit, Handlebars, DynamicSelect2, BaseView, AlertView, hbTemplate) {
	"use strict";

	var DEFAULT_SELECT2_OPTIONS = {
		theme : 'bootstrap'
	};

	var optionTemplate = Handlebars.compile('<option value={{id}}>{{text}}</option>');

	var view = BaseView.extend({

		events : {
			'select2:select #series-title-input' : 'editSelectedSeriesTitle',
			'select2:select #pub-subtype-input' : 'changePublicationSubType',
			'click .create-btn' : 'showEditSection',
			'click .save-btn' : 'saveSeriesTitle',
			'click .cancel-btn' : 'clearFields',
			'click .create-new-btn' : 'createOrEditNew'
		},

		bindings : {
			'#series-title-text-input' : 'text',
			'#series-doi-name-input' : 'seriesDoiName',
			'#online-issn-input' : 'onlineIssn',
			'#print-issn-input' : 'printIssn',
			'#active-input' : {
				observe: 'active',
				onGet: function (value) {
					return (value === 'true');
				},
				onSet: function (val) {
					return (val) ? 'true' : 'false';
				}
			}
		},

		template : hbTemplate,

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
			// Create child views
			this.alertView = new AlertView({
				el : '.alert-container'
			});

			this.listenTo(this.model, 'change:publicationSubtype', this.updatePublicationSubtype);
		},

		render : function() {
			this.context = this.model.attributes;
			BaseView.prototype.render.apply(this, arguments);
			this.stickit();

			this.alertView.setElement(this.$('.alert-container'));

			this.$('#series-title-input').select2(DynamicSelect2.getSelectOptions({
				lookupType : 'publicationseries',
				activeSubgroup : true
			}, DEFAULT_SELECT2_OPTIONS));
			this.$('#pub-subtype-input').select2(DynamicSelect2.getSelectOptions({
				lookupType : 'publicationsubtypes'
			}, DEFAULT_SELECT2_OPTIONS));

			this.updatePublicationSubtype();
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
			var $select = this.$('#pub-subtype-input');
			var subtype;
			if (this.model.has('publicationSubtype')) {
				subtype = this.model.get('publicationSubtype');
				//TODO: Need to get text
				$select.append(optionTemplate(subtype));
				$select.val(subtype.id).trigger('change');
			}
		},

		/*
		 * DOM event handlers
		 */

		showEditSection : function() {
			this.$('.edit-div').removeClass('hidden').addClass('show');
			this.$('.create-or-edit-div').removeClass('show').addClass('hidden');
		},

		editSelectedSeriesTitle : function(ev) {
			var seriesId = ev.currentTarget.value;
			this.model.set('id', seriesId);
			this.model.fetch()
				.fail(function() {
					this.alertView.showDangerAlert('Failed to fetch series title');
				});
			this.showEditSection();
		},

		changePublicationSubType : function(ev) {
			this.model.set('publicationSubtype', {id : ev.currentTarget.value});
		},

		saveSeriesTitle : function(ev) {
			var self = this;
			var $loadingIndicator = this.$('.loading-indicator');
			var $errorDiv = this.$('.validation-errors');
			$loadingIndicator.show();
			$errorDiv.html('');
			this.model.save()
				.done(function() {
					self.alertView.showSuccessAlert('Successfully saved the series title');
				})
				.fail(function(jqxhr) {
					self.alertView.showDangerAlert('Unable to save the series title');
					if ((jqxhr.responseJSON) && (jqxhr.responseJSON.validationErrors)) {
						$errorDiv.html('<pre>' + JSON.stringify(jqxhr.responseJSON.validationErrors) + '</pre>');
					}
				})
				.always(function() {
					$loadingIndicator.hide();
				});
		}

	});

	return view;
});
