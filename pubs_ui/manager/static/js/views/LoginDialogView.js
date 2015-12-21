/* jslint browser: true */

define([
	'jquery',
	'bootstrap',
	'views/BaseView',
	'hbs!hb_templates/loginDialog'
], function($, bootstrap, BaseView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({
		template : hbTemplate,

		events : {
			'click submit-btn' : 'verifyCredentials',
			'form submit' : 'verifyCredentials',
			'click cancel-btn' : 'dismissDialog'
		},


	});

	return view;
});