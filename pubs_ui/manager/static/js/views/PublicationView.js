/*jslint browser: true */

define([
	'handlebars',
	'underscore',
	'bootstrap',
	'datetimepicker',
	'views/BaseView',
	'views/AlertView',
	'views/ConfirmationDialogView',
	'text!hb_templates/publication.hbs',
	'backbone.stickit'
], function(Handlebars, _, bootstrap, datetimepicker, BaseView, AlertView, ConfirmationDialogView, hbTemplate, Stickit) {
	"use strict";

	var view = BaseView.extend({

		events : {
			'click .reset-btn' : 'reloadPage',
			'click .release-btn' : 'releasePub',
			'click .save-btn' : 'savePub',
			'click .publish-btn' : 'publishPub',
			'click .delete-btn' : 'deletePub'
		},

		bindings : {
			'.validation-errors' : {
				observe : 'validationErrors',
				updateMethod : 'html',
				onGet : function(value) {
					if (value && _.isArray(value) && value.length > 0)
						return '<pre>' + JSON.stringify(value) + '</pre>';
					else {
						return '';
					}
				}
			},
			'#pub-id-div input' : 'id',
			'#pub-index-id-div input' : 'indexId',
			'#ipds-div input' : 'ipdsId',
			'#pub-display-to-public-div input' : {
				observe : 'displayToPublicDate',
				onGet : function(value) {
					if (value) {
						return value + ' ET';
					}
					else {
						return '';
					}
				}
			}
		},

		template : Handlebars.compile(hbTemplate),

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(this, arguments);

			this.$('#display-date').datetimepicker({
				format : 'YYYY-MM-DDTHH:mm:ss [E]T'
			});
			this.$('#display-date').on('dp.change', function(ev) {
				self.model.set('displayToPublicDate', ev.date.format('YYYY-MM-DDTHH:mm:ss'));
			});
			$('[data-toggle="tooltip"]').tooltip();

			/* Sets up the binding between DOM elements and the model */
			this.stickit();

			this.alertView.setElement(this.$('.alert-container'));
			this.confirmationDialogView.setElement(this.$('.confirmation-dialog-container')).render();
		},

		initialize : function(options) {
			var self = this;
			BaseView.prototype.initialize.apply(this, arguments);

			this.context.id = this.model.get('id');
			this.listenTo(this.model, 'change:id', this.updatePubId);

			this.alertView = new AlertView();
			this.confirmationDialogView = new ConfirmationDialogView();
		},

		remove : function() {
			this.alertView.remove();
			this.confirmationDialogView.remove();
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		},

		updatePubId : function(model, newId) {
			if (newId) {
				this.$('#pub-preview-div').show();
				this.$('#pub-preview-div a').attr('href', 'https://pubs.er.usgs.gov/preview/' + newId);
			}
			else {
				this.$('#pub-preview-div').hide();
			}
		},

		reloadPage : function() {
			window.location.reload();
		},

		releasePub : function() {
			var self = this;
			this.model.release()
				.done(function() {
					self.returnToSearch();
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
			var loadingDiv = this.$('.loading-indiciator');

			loadingDiv.show();

			return this.model.save({}, {
				contentType : 'application/json',
				headers : {
					'Accept' : 'application/json'
				},
				success : function() {
					self.alertView.showSuccessAlert('The publication was successfully saved');
				},
				error : function(model, response) {
					if (_.has(response, 'responseJSON') &&
						_.has(response.responseJSON, 'validationErrors')
						&& (response.responseJSON.validationErrors.length > 0)) {
						self.model.set('validationErrors', response.responseJSON.validationErrors);
						self.alertView.showDangerAlert('Publication not saved with validation errors')
					}
					else {
						self.alertView.showDangerAlert('Publication not saved.');
					}
				}
			}).always(function() {
				loadingDiv.hide();
			});
		},

		publishPub : function() {
			var self = this;

			var callPublish = function() {
				var loadingDiv = self.$('.loading-indicator');
				loadingDiv.show();
				self.model.publish()
					.done(function() {
						self.returnToSearch();
					})
					.fail(function(error) {
						if (_.isObject(error)) {
							self.alertView.showDangerAlert('Publication not published: validation errors');
						}
						else {
							self.alertView.showDangerAlert(error);
						}
					})
					.always(function() {
						loadingDiv.hide();
					});
			};

			this.savePub()
				.done(function() {
					self.confirmationDialogView.show('Are you sure you want to publish this publication?', callPublish);
				});
		},

		deletePub : function() {
			var self = this;

			var callDelete = function() {
				self.model.destroy({
					headers: {
						'Accept': 'application/json text/plain, */*'
					}
				})
					.done(function() {
						self.returnToSearch()
					})
					.fail(function(jqxhr) {
						self.alertView.showDangerAlert('Publication not deleted with error: ' + jqxhr.statusText);
					})

			};

			if (this.model.has('id')) {
				this.confirmationDialogView.show('Are you sure you want to delete this publication?', callDelete);

			}

		},

		returnToSearch : function() {
			this.router.navigate('search', {trigger: true});
		}
	});

	return view;
});
