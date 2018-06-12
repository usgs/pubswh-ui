/*jslint browser: true */
/* global define */

define([
	'underscore',
	'jquery',
	'bootstrap',
	'datetimepicker',
	'backbone.stickit',
	'module',
	'views/BaseView',
	'views/AlertView',
	'views/ConfirmationDialogView',
	'views/LoginDialogView',
	'views/BibliodataView',
	'views/LinksView',
	'views/ContributorsView',
	'views/SPNView',
	'views/CatalogingView',
	'views/GeospatialView',
	'hbs!hb_templates/publication'
], function(_, $, bootstrap, datetimepicker, Stickit, module, BaseView, AlertView, ConfirmationDialogView, LoginDialogView,
			BibliodataView, LinksView, ContributorsView, SPNView, CatalogingView, GeospatialView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		events : {
			'click .reset-btn' : 'reloadPage',
			'click .release-btn' : 'releasePub',
			'click .save-btn' : 'savePub',
			'click .publish-btn' : 'publishPub',
			'click .delete-btn' : 'deletePub',
			'click .edit-tabs a' : 'showTab',
			'dp.change #display-date' : 'changeDisplayToPublicDate',
			'click .locked-pub-dialog-container .close-btn' : 'closeLockedDialog'
		},

		bindings : {
			'.validation-errors' : {
				observe : 'validationErrors',
				updateMethod : 'html',
				onGet : function(value) {
					if (value && _.isArray(value) && value.length > 0) {
						return '<pre>' + JSON.stringify(value) + '</pre>';
					}
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
			this.updateIndexId(this.model, this.model.get('indexId'));

			// Set up datepicker
			this.$('#display-date').datetimepicker({
				format : 'YYYY-MM-DDTHH:mm:ss [E]T'
			});

			// Sets up the binding between DOM elements and the model //
			this.stickit();

			// Set the elements for child views and render if needed.
			this.alertView.setElement(this.$('.alert-container'));
			this.confirmationDialogView.setElement(this.$('.confirmation-dialog-container')).render();
			this.loginDialogView.setElement(this.$('.login-dialog-container')).render();

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

				// The tinymce have to be initialize sequentially
				self.tabs.bibliodata.view.initializeTinyMce().done(function() {
					self.tabs.spn.view.initializeTinyMce();
				});
			}).fail(function(jqXhr) {
				var $modal = self.$('.locked-pub-dialog-container .modal');
				var message;
				if (jqXhr.status === 409) {
					message = (jqXhr.responseJSON.validationErrors.length > 0) ? jqXhr.responseJSON.validationErrors[0].message : 'Unknown error'
					$modal.find('.modal-body').html(message + '. Click OK to return to the Search page');
					$modal.modal();
				}
				else {
					self.alertView.showDangerAlert('Can\'t retrieve the publication: ' + jqXhr.statusText);
				}
			});

			return this;
		},

		/*
		 * @param {Object} options
		 *     @prop {String} el - jquery selector where the view should be rendered
		 *     @prop {PublicationModel} model
		 */
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.context.indexId = this.model.get('indexId');
			this.context.previewUrl = module.config().previewUrl;
			this.listenTo(this.model, 'change:indexId', this.updateIndexId);
			this.listenTo(this.model, 'sync', this._readOnlyControlIpds);

			if (this.model.isNew()) {
				this.fetchPromise = $.Deferred().resolve();
			}
			else {
				this.fetchPromise = this.model.fetch();
			}

			// Create child views
			this.alertView = new AlertView({
				el : '.alert-container'
			});
			this.confirmationDialogView = new ConfirmationDialogView({
				el : '.confirmation-dialog-container'
			});
			this.loginDialogView = new LoginDialogView({
				el : '.login-dialog-container'
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
						model : this.model
					})
				},
				spn : {
					el : '#spn-pane',
					view : new SPNView({
						el : '#spn-pane',
						model : this.model
					})
				},
				cataloging : {
					el : '#cataloging-pane',
					view : new CatalogingView({
						el : '#cataloging-pane',
						model : this.model
					})
				},
				geospatial : {
					el : '#geospatial-pane',
					view : new GeospatialView({
						el : '#geospatial-pane',
						model : this.model
					})
				}

			};
		},

		remove : function() {
			this.alertView.remove();
			this.confirmationDialogView.remove();
			this.loginDialogView.remove();
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
		updateIndexId : function(model, newId) {
			if (newId) {
				this.$('#pub-preview-div').show();
				this.$('#pub-preview-div a').attr('href', this.context.previewUrl + newId);
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
				}).fail(function(jqXHR, error) {
					if (jqXHR.status === 401) {
						self.loginDialogView.show(function() {
							self.alertView.showWarningAlert('Please click Release to release the publication');
						});
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
					if (jqXhr.status === 401) {
						self.loginDialogView.show(function() {
							self.alertView.showWarningAlert('Please click Save Changes to save the publication');
						});
					}
					else if (_.has(response, 'responseJSON') &&
						_.has(response.responseJSON, 'validationErrors') &&
						(response.responseJSON.validationErrors.length > 0)) {
						self.model.set('validationErrors', response.responseJSON.validationErrors);
						self.alertView.showDangerAlert('Publication not saved with validation errors');
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
					.fail(function(jqXHR, error) {
						if (jqXHR.status === 401) {
							self.loginDialogView.show(function() {
								self.alertView.showWarningAlert('Please click Publish to publish the publication');
							});
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
						self.returnToSearch();
					})
					.fail(function(jqxhr) {
						if (jqxhr.status === 401) {
							self.loginDialogView.show(function() {
								self.alertView.showWarningAlert('Please clicke Delete to delete the publication');
							});
						}
						else {
							self.alertView.showDangerAlert('Publication not deleted with error: ' + jqxhr.statusText);
						}
					});

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
		},

		changeDisplayToPublicDate : function(ev) {
			if (ev.date) {
				this.model.set('displayToPublicDate', ev.date.format('YYYY-MM-DDTHH:mm:ss'));
			}
			else {
				this.model.unset('displayToPublicDate');
			}
		},

		closeLockedDialog : function(ev) {
			ev.preventDefault();
			window.location.assign(module.config().scriptRoot + '/manager');
		},

		_readOnlyControlIpds: function() {
			var $ipdsInput = this.$('#ipds-input');
			if (this.model.get('ipdsId')) {
				$ipdsInput.prop('readonly', true);
			}
			else {
				$ipdsInput.prop('readonly', false);
			}
		}
	});

	return view;
});
