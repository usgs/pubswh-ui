/* jslint browser: true */

define([
	'handlebars',
	'backgrid',
	'views/BaseView'
], function(Handlebars, Backgrid, BaseView) {
	"use strict";

	var view = BaseView.extend({

		template : Handlebars.compile('<div class="contributors-grid-container"></div>'),

		/*
		 * @constructs
		 * @param {Object} options
		 *     @prop {PublicationContributorCollection} collection
		 *     @prop {String} el - jquery selector where the view will be rendered.
		 */
		initialize : function(options) {
			var ContribTypeCellFormatter = {
				fromRaw : function(rawData, model) {
					if (rawData) {
						return ['Corporation'];
					}
					else {
						return ['Person'];
					}
				},
				toRaw : function(formattedData, model) {
					return (formattedData === 'Corporation');
				}
			}
			var columns = [{
				name : 'corporation',
				label : 'Kind',
				editable : true,
				cell : Backgrid.SelectCell.extend({
					formatter : ContribTypeCellFormatter,
					optionValues : [['Person','Person'], ['Corporation', 'Corporation']]
				})
			}];
			BaseView.prototype.initialize.apply(this, arguments);

			this.grid = new Backgrid.Grid({
				columns : columns,
				collection : this.collection
			});
		},

		render : function() {
			BaseView.prototype.render.apply(this, arguments);

			this.$('.contributors-grid-container').html(this.grid.render().el);
		}
	});

	return view;
})
