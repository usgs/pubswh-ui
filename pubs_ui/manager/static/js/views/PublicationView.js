/*jslint browser: true */

define([
	'underscore',
	'bootstrap',
	'datetimepicker',
	'views/BaseView',
	'views/AlertView',
	'views/ConfirmationDialogView',
	'views/BibliodataView',
	'views/LinksView',
	'views/ContributorsView',
	'hbs!hb_templates/publication',
	'backbone.stickit'
], function(_, bootstrap, datetimepicker, BaseView, AlertView, ConfirmationDialogView,
			BibliodataView, LinksView, ContributorsView, hbTemplate, Stickit) {
	"use strict";

	var view = BaseView.extend({

		events : {
			'click .reset-btn' : 'reloadPage',
			'click .release-btn' : 'releasePub',
			'click .save-btn' : 'savePub',
			'click .publish-btn' : 'publishPub',
			'click .delete-btn' : 'deletePub',
			'click .edit-tabs a' : 'showTab'
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

		template : hbTemplate,

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(this, arguments);
			this.updatePubId(this.model, this.model.get('id'));

			// Set up datepicker
			this.$('#display-date').datetimepicker({
				format : 'YYYY-MM-DDTHH:mm:ss [E]T'
			});
			this.$('#display-date').on('dp.change', function(ev) {
				self.model.set('displayToPublicDate', ev.date.format('YYYY-MM-DDTHH:mm:ss'));
			});

			// Sets up the binding between DOM elements and the model //
			this.stickit();

			// Set the elements for child views and render if needed.
			this.alertView.setElement(this.$('.alert-container'));
			this.confirmationDialogView.setElement(this.$('.confirmation-dialog-container')).render();

			this.$('[data-toggle="tooltip"]').tooltip({
				trigger : 'hover'
			});

			// Don't render tabs until the publication has been fetched.
			this.fetchPromise.done(function() {
				_.each(self.tabs, function (tab) {
					tab.view.setElement(tab.el).render();
					tab.view.$('[data-toggle="tooltip"]').tooltip({
						trigger : 'hover'
					});
				});
			}).fail(function(jqXhr) {
				self.alertView.showDangerAlert('Can\'t retrieve the publication: ' + jqXhr.statusText);
			});
		},

		/*
		 * @param {Object} options
		 *     @prop {String} el - jquery selector where the view should be rendered
		 *     @prop {PublicationModel} model
		 */
		initialize : function(options) {
			var self = this;
			BaseView.prototype.initialize.apply(this, arguments);

			this.context.id = this.model.get('id');
			this.listenTo(this.model, 'change:id', this.updatePubId);

			if (this.context.id) {
				this.fetchPromise = this.model.fetch();
			}
			else {
				this.fetchPromise = $.Deferred().resolve();
			}

			// Create child views
			this.alertView = new AlertView({
				el : '.alert-container'
			});
			this.confirmationDialogView = new ConfirmationDialogView({
				el : '.confirmation-dialog-container'
			});

			this.tabs = {
				bibliodata : {
					el: '#bibliodata-pane',
					view: new BibliodataView({
						el: '#bibliodata-pane',
						model : this.model
					})
				},
				links : {
					el : '#links-pane',
					view : new LinksView({
						el : '#links-pane',
						collection : this.model.get('links')
					})
				},
				contributors : {
					el : '#contributors-pane',
					view : new ContributorsView({
						el : '#contributors-pane',
						model : this.model.get('contributors')
					})
				}
			};
		},

		remove : function() {
			this.alertView.remove();
			this.confirmationDialogView.remove();
			_.each(this.tabs, function(t) {
				t.view.remove();
			});
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		},

		/*
		 * Updates the publication view when the publication id is updated.
		 * @param {PublicationModel} model
		 * @param {String} newId
		 */
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
						self.alertView.showDangerAlert('Publication not released: ' + error);
					}
				});
		},

		savePub : function() {
			var self = this;
			var loadingDiv = this.$('.loading-indicator');
			var isNew = this.model.isNew();

			loadingDiv.show();

			return this.model.save({}, {
				contentType: 'application/json',
				headers: {
					'Accept': 'application/json'
				}
			})
				.done(function() {
					self.alertView.showSuccessAlert('The publication was successfully saved');
					if (isNew) {
						self.router.navigate('publication/' + self.model.get('id'));
					}
				})
				.fail(function(jqXhr, textStatus, error) {
					var response = jqXhr;
					if (_.has(response, 'responseJSON') &&
						_.has(response.responseJSON, 'validationErrors')
						&& (response.responseJSON.validationErrors.length > 0)) {
						self.model.set('validationErrors', response.responseJSON.validationErrors);
						self.alertView.showDangerAlert('Publication not saved with validation errors')
					}
					else {
						self.alertView.showDangerAlert('Publication not saved: ' + error);
					}
				})
				.always(function() {
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
			else {
				self.returnToSearch();
			}

		},

		returnToSearch : function() {
			this.router.navigate('search', {trigger: true});
		},

		showTab : function(ev) {
			ev.preventDefault();
			this.$('.edit-tabs').tab('show');
		}
	});

	return view;
});
