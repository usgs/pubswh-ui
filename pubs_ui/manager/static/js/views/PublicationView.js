/*jslint browser: true */

define([
	'handlebars',
	'underscore',
	'bootstrap',
	'datetimepicker',
	'views/BaseView',
	'views/AlertView',
	'text!hb_templates/publication.hbs'
], function(Handlebars, _, bootstrap, datetimepicker, BaseView, AlertView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		events : {
			'click .reset-btn' : 'reloadPage',
			'click .release-btn' : 'releasePub',
			'click .save-btn' : 'savePub',
			'click .publish-btn' : 'publishPub',
			'click .delete-btn' : 'deletePub'
		},

		template : Handlebars.compile(hbTemplate),

		render : function() {
			BaseView.prototype.render.apply(this, arguments);
			this.$('#display-date').datetimepicker();
			this.alertView.setElement(this.$('.alert-container'));

		},

		initialize : function(options) {
			var self = this;
			BaseView.prototype.initialize.apply(this, arguments);

			this.alertView = new AlertView();

			if (this.model.has('id')) {
				this.model.fetch().done(function(jqXhr){
					self.context.model = self.model.attributes;
					self.render();
				}).fail(function(jqXHR, textStatus) {
					self.render();
					self.alertView.showDangerAlert('Unable to connect with services: ' + textStatus);
				});
			}
			else {
				this.render();
			}
		},

		reloadPage : function() {
			window.location.reload();
		},

		releasePub : function() {
			var self = this;
			this.model.release().done(function() {
				self.router.navigate('search', {trigger: true});
			}).fail(function(error) {
				if (_.isObject(error)) {
					self.alertView.showDangerAlert('Publication not released: validation errors');
				}
				else {
					self.alertView.showDangerAlert(error);
				}
			});
		},

		savePub : function() {
			var self = this;

			this.model.unset('interactions');
			this.model.save({}, {
				contentType : 'application/json',
				headers : {
					'Accept' : 'application/json'
				},
				success : function(model, response, options) {
					self.alertView.showSuccessAlert('The publication was successfully saved');
				},
				error : function(model, response, options) {
					self.alertView.showDangerAlert('Publication not saved.')
					self.$('.validation-errors').html(JSON.stringify(response.responseJSON.validationErrors));
				}
			}).done(function() {})

		},

		publishPub : function() {

		},

		deletePub : function() {

		}
	});

	return view;
});
