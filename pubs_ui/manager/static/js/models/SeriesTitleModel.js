/* jslint browser: true */
/* global define */

define([
	'backbone',
	'module'
], function(Backbone, module) {
	"use strict";
	var model = Backbone.Model.extend({

		urlRoot : module.config().scriptRoot + '/manager/services/publicationSeries',
		
		defaults : {
			'active' : 'true'
		}

	});

	return model;
})