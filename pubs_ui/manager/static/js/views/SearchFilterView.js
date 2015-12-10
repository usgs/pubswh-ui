/* jslint browser: true */

define([
	'views/BaseView',
	'hbs!hb_templates/searchFilter'
], function(BaseView, hb_template) {
	"use strict";

	var view = BaseView.extend({

		template : hb_template,

		events : {
			'change #search-term-input' : 'updateQTerm'
		},

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.listenTo(this.model, 'change:q', this.changeQTerm)
		},

		updateQterm : function(ev) {
			this.model.set('q', ev.currentTarget.value);
		},

		changeQTerm : function() {
			this.$('#search-term-input').val(this.model.get('q'));
		}

	});

	return view;
});