/* jslint browser:true */

define([
	'bootstrap',
	'models/ContributorTypeCollection',
	'models/PublicationContributorCollection',
	'views/BaseView',
	'views/ContributorTabView',
	'hbs!hb_templates/contributors'
], function(bootstrap, ContributorTypeCollection, PublicationContributorCollection, BaseView, ContributorTabView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		events : {
			'click .contributor-types-tabs' : 'showTab'
		},

		template : hbTemplate,

		/*
		 * @constructs
		 * @param {Object} options
		 *     @prop {String} el - jquery selector where this view is rendered
		 *     @prop {PublicationModel} model - view deals with the contributors attribute
		 */
		initialize : function(options) {
			var self = this;
			var fetchDeferred = $.Deferred();
			BaseView.prototype.initialize.apply(this, arguments);

			this.contributorTypeCollection = new ContributorTypeCollection();
			this.contributorTypeCollection.fetch().always(function() {
				var contributors = self.model.get('contributors');
				self.typeTabViews = self.contributorTypeCollection.map(function(model) {
					var typeProp = model.attributes.text.toLowerCase();
					if (!contributors.has(typeProp)) {
						contributors.set(typeProp, new PublicationContributorCollection())
					}

					return {
						el : '#type-' + model.get('id') + '-pane .grid',
						view : new ContributorTabView({
							collection : contributors.get(typeProp),
							el : '#type-' + model.get('id') + '-pane .grid'
						})
					};
				});
				self.model.set('contributors', contributors);
				fetchDeferred.resolve();
			});
			this.createTabViewsPromise = fetchDeferred.promise();
		},

		render : function() {
			var self = this;
			this.createTabViewsPromise.done(function() {
				self.context.contributorTypes = self.contributorTypeCollection.toJSON();
				BaseView.prototype.render.apply(self, arguments);

				_.each(self.typeTabViews, function(tab) {
					tab.view.setElement(tab.el).render();
				});
			});
		},

		showTab : function(ev) {
			ev.preventDefault();
			this.$('.contributor-types-tabs').tab('show');
		}
	});

	return view;
})
