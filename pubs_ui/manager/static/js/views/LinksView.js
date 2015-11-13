/* jslint browser: true */

define([
		'jquery-ui',
	'views/BaseView',
	'hbs!hb_templates/links'
], function(jqueryUI, BaseView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		events : {
			'click button' : 'addNewLink'
		},

		template : hbTemplate,


		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

		},

		render : function() {
			BaseView.prototype.render.apply(this, arguments);

			return this;
		}
	});

	return view;
})
