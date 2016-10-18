/* jslint browser: true */
/* global define */

define([
	'backbone.stickit',
	'views/BaseView',
	'hbs!hb_templates/editCorporation'
], function(stickit, BaseView, hbTemplate) {
	"use strict";

	/*
	 * @constructs
	 * @param {Object} options
	 * 		@prop {Jquery selector} el
	 * 		@prop {ContributorModel} model
	 */
	var view = BaseView.extend({
		template : hbTemplate,

		bindings : {
			'#organization' : 'organization'
		},

		render : function() {
			BaseView.prototype.render.apply(this, arguments);
			this.stickit();
			return this;
		}

	});

	return view;
});