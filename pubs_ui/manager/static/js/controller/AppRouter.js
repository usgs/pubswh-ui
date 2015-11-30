/*jslint browser: true */

define([
	'jquery',
	'backbone',
	'views/SearchView',
	'views/PublicationView',
	'views/EditContributorView',
	'models/PublicationModel',
	'models/ContributorModel'
], function ($, Backbone, SearchView, PublicationView, EditContributorView, PublicationModel, ContributorModel) {
	"use strict";

	var appRouter = Backbone.Router.extend({
		routes: {
			'': 'searchView',
			'search': 'searchView',
			'publication' : 'publicationView',
			'publication/:pubId' : 'publicationView',
			'contributor' : 'editContributorView',
			'contributor/:contribId' : 'editContributorView'
		},

		applicationContextDiv: '#main-content',

		/*
		 * Create a view a put in in the applicationContextDiv. This view becomes the router's currentView
		 * @param {Backbone.View} view - The view to create
		 * @param {Object} opts - options to use when creating the view
		 */
		createView: function (view, opts) {
			var newEl = $('<div />');

			this.removeCurrentView();
			$(this.applicationContextDiv).append(newEl);
			this.currentView = new view($.extend({
				el: newEl,
				router: this
			}, opts));

			return this.currentView;
		},

		/*
		 * Remove the currentView
		 */
		removeCurrentView: function () {
			if (this.currentView) {
				this.currentView.remove();
			}
		},

		searchView: function () {
			this.createView(SearchView).render();
		},

		publicationView : function(pubId) {
			var model = new PublicationModel();
			if (pubId) {
				model.set('id', pubId);
			}

			this.createView(PublicationView,
				{
					model : model
				}
			).render();
		},

		editContributorView : function(contribId) {
			var model = new ContributorModel();
			if (contribId) {
				model.set('contributorId', contribId);
			}

			this.createView(EditContributorView, {
				model : model
			}).render();

		}
	});

	return appRouter;
});
