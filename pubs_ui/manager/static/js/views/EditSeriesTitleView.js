/* jslint browser: true */
/* global define */

define([
	'jquery',
	'underscore',
	'select2',
	'backbone.stickit',
	'bootstrap',
	'utils/DynamicSelect2',
	'models/PublicationSubtypeCollection',
	'views/BaseView',
	'views/AlertView',
	'hbs!hb_templates/editSeriesTitle'
], function($, _, select2, stickit, bootstrap, DynamicSelect2, PublicationSubtypeCollection, BaseView, AlertView, hbTemplate) {
	"use strict";

	var DEFAULT_SELECT2_OPTIONS = {
		theme : 'bootstrap'
	};

	var view = BaseView.extend({

		events : {
			'select2:select #edit-pub-subtype-input' : 'updateEditSeriesTitleSelect',
			'select2:select #series-title-input' : 'editSelectedSeriesTitle',
			'select2:select #pub-subtype-input' : 'changePublicationSubType',
			'click .create-btn' : 'editNewSeriesTitle',
			'click .save-btn' : 'saveSeriesTitle',
			'click .cancel-btn' : 'resetFields',
			'click .create-new-btn' : 'editNew',
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

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
			if (!this.model.isNew()) {
				this.model.fetch();
			}

			// Create child views
			this.alertView = new AlertView({
				el : '.alert-container'
			});

			//Retrieve lookup for publication subtype
			this.publicationSubtypeCollection = new PublicationSubtypeCollection();
			this.pubSubtypePromise = this.publicationSubtypeCollection.fetch();

			this.listenTo(this.model, 'change:publicationSubtype', this.updatePublicationSubtype);
		},

		render : function() {
			var self = this;
			this.context = this.model.attributes;
			BaseView.prototype.render.apply(this, arguments);
			this.stickit();

			this.alertView.setElement(this.$('.alert-container'));

			this.$('#series-title-input').select2(DynamicSelect2.getSelectOptions({
				lookupType : 'publicationseries',
				parentId : 'publicationsubtypeid',
				getParentId : function() {
					return self.$('#edit-pub-subtype-input').val();
				},
				activeSubgroup : true
			}, DEFAULT_SELECT2_OPTIONS));
			this.pubSubtypePromise.done(function() {
				var select2Options = _.extend({
					data : [{id : ''}].concat(self.publicationSubtypeCollection.toJSON())
				}, DEFAULT_SELECT2_OPTIONS);
				self.$('#edit-pub-subtype-input').select2(select2Options);
				self.$('#pub-subtype-input').select2(select2Options);
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
			var $select = this.$('#pub-subtype-input');
			var subtype;
			if (this.model.has('publicationSubtype')) {
				subtype = this.model.get('publicationSubtype');
				$select.val(subtype.id).trigger('change');
			}
			else {
				$select.val('').trigger('change');
			}
		},

		/*
		 * DOM event handlers
		 */

		updateEditSeriesTitleSelect : function(ev){
			this.$('#series-title-input').prop('disabled', false);
		},

		showEditSection : function() {
			this.$('.edit-div').removeClass('hidden').addClass('show');
			this.$('.create-or-edit-div').removeClass('show').addClass('hidden');
		},

		hideEditSection : function() {
			this.$('#edit-pub-subtype-input').val('').trigger('change');
			this.$('#series-title-input').val('').trigger('change');
			this.$('.edit-div').removeClass('show').addClass('hidden');
			this.$('.create-or-edit-div').removeClass('hidden').addClass('show');
			this.alertView.closeAlert();
			this.$('.validation-errors').html('');
		},

		editNewSeriesTitle : function(ev) {
			this.$('.delete-btn').prop('disabled', true);
			this.showEditSection();
		},

		editSelectedSeriesTitle : function(ev) {
			var self = this;
			var seriesId = ev.currentTarget.value;
			var seriesTitle = ev.currentTarget.selectedOptions[0].innerHTML;
			var $loadingIndicator = this.$('.loading-indicator');
			
			$loadingIndicator.show();
			this.alertView.closeAlert();

			this.model.set('id', seriesId);
			this.model.fetch()
				.done(function() {
					self.$('.delete-btn').prop('disabled', false);
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
					self.$('.delete-btn').prop('disabled', false);
					self.router.navigate('seriesTitle/' + self.model.get('id'));
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
		},
		resetFields : function(ev) {
			this.model.fetch()
			.fail(function() {
				this.alertView.showDangerAlert('Failed to fetch series title');
			});
		},

		editNew : function(ev) {
			this.hideEditSection();
			this.model.clear();
			this.router.navigate('seriesTitle');
		},

		deleteSeriesTitle : function(ev) {
			var self = this;
			var seriesTitle = this.model.get('text');
			var $loadingIndicator = this.$('.loading-indicator');
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

	return view;
});
