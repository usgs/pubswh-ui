/* jslint browser: true */

define([
	'handlebars',
	'jquery',
	'jquery-ui',
	'select2',
	'module',
	'backbone.stickit',
	'views/BaseView',
	'hbs!hb_templates/contributorTabRow'
], function(Handlebars, $, jqueryUi, select2, module, stickit, BaseView, hb_template) {
	"use strict";
	var view = BaseView.extend({

		bindings : {
			'.affiliation-input' : {
				observe : 'affiliation',
				onGet : function(value, options) {
					if (value && _.has(value, 'text')) {
						return value.text;
					}
					else {
						return '';
					}
				}
			}
		},

		events : {
			'select2:select .contributor-type-input' : 'selectType',
			'select2:select .contributor-name-input' : 'selectName'
		},

		template : hb_template,

		optionTemplate : Handlebars.compile('<option value={{contributorId}}>{{text}}</option>'),

		/*
		 * @constructs
		 * @param {Object} options
		 *     @prop {String} el - jquery selector where view will be rendered
		 *     @prop {PublicationContributorModel} model
		 */
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.listenTo(this.model, 'change:corporation', this.updateType);
			this.listenTo(this.model, 'change:text', this.updateName);
			this.listenTo(this.model, 'sync', this.updateRow);
		},

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(this, arguments);

			this.stickit();

			//Initialize select2's
			this.$('.contributor-type-input').select2({
				theme : 'bootstrap'
			});
			this.updateType();

			this.$('.contributor-name-input').select2({
				theme: 'bootstrap',
				ajax : {
					url : function() {
						return module.config().lookupUrl + (self.model.get('corporation') ? 'corporations' : 'people');
					},
					data : function(params) {
						var result = {
							mimetype : 'json'
						};
						if (_.has(params, 'term')) {
							result.text = params.term;
						}
						return result;
					},
					processResults : function(resp) {
						return {
							results : resp
						};
					}
				}

			});
			this.updateName();
			return this;
		},

		selectType : function(ev) {
			this.model.set('corporation', ev.currentTarget.value === 'corporations');
		},

		selectName : function(ev) {
			var v = ev.currentTarget.value;
			var text = ev.currentTarget.selectedOptions[0].innerHTML;

			console.log("In selectName with value " + v + ' text ' + text);
			this.model.set('contributorId', v);
			this.model.fetch();
		},

		updateType : function() {
			var $select = this.$('.contributor-type-input');
			var corporation = this.model.get('corporation');
			if (corporation) {
				$select.val('corporations').trigger('change');
			}
			else {
				$select.val('people').trigger('change');
			}
		},

		updateName : function() {
			var $select = this.$('.contributor-name-input');
			var id = this.model.get('contributorId');
			console.log('Update contributor ' + id);

			if (id) {
				if ($select.find('option[value="' + id + '"]').length === 0) {
					$select.append(this.optionTemplate(this.model.attributes));
				}
				$select.val(this.model.get('contributorId')).trigger('change');
			}
			else {
				$select.val('').trigger('change');
			}
		},

		updateRow : function() {
			this.updateName();
		}
	});

	return view;
});
