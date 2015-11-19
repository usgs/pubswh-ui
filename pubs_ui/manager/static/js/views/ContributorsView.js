/* jslint browser:true */

define([
	'bootstrap',
	'models/ContributorTypeCollection',
	'views/BaseView',
	'hbs!hb_templates/contributors'
], function(bootstrap, ContributorTypeCollection, BaseView, hbTemplate) {
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
			BaseView.prototype.initialize.apply(this, arguments);

			this.contributorTypeCollection = new ContributorTypeCollection();
			this.fetchContributorTypes = this.contributorTypeCollection.fetch();
		},

		render : function() {
			var self = this;
			this.fetchContributorTypes.always(function() {
				self.context.contributorTypes = self.contributorTypeCollection.toJSON();
				BaseView.prototype.render.apply(self, arguments);
			});
		},

		showTab : function(ev) {
			ev.preventDefault();
			this.$('.contributor-types-tabs').tab('show');
		}
	});

	return view;
})
