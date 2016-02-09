/* jslint browser: true */

define([
	'handlebars',
	'views/BaseView'
], function(Handlebars, BaseView) {
	"use strict";

	var view = BaseView.extend({

		template : Handlebars.compile('<h3>Contributor editing not yet implemented</h3>')
	});

	return view;
})
