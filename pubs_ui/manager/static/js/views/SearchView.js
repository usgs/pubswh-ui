/*jslint browser: true */

define([
	'handlebars',
	'views/BaseView',
	'views/AlertView',
	'text!hb_templates/search.hbs',
	'backgrid',
	'select-all',
	'backbone.stickit',
	'models/PublicationCollection'
], function (Handlebars, BaseView, AlertView, hbTemplate, Backgrid, SelectAll, Stickit, PublicationCollection) {
	"use strict";

	var view = BaseView.extend({

		events : {
		},

		template: Handlebars.compile(hbTemplate),

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(this, arguments);

			// Set the elements for child views and render if needed.
			this.alertView.setElement(this.$('.alert-container'));

			//Don't render grid until the publications have been fetched.
			this.fetchPromise.done(function() {
				// Render the grid and attach the root to your HTML document
				$(".pub-grid").append(self.grid.render().el);
			}).fail(function(jqXhr) {
				self.alertView.showDangerAlert('Can\'t retrieve the list of publications: ' + jqXhr.statusText);
			});
		},

		/*
		 * @param {Object} options
		 *     @prop {String} el - jquery selector where the view should be rendered
		 */
		initialize : function(options) {
			var self = this;
			BaseView.prototype.initialize.apply(this, arguments);

			this.context.tempAdd = false;

			this.publicationList = new PublicationCollection();
			this.listenTo(this.publicationList, 'backgrid:selected', this.editPublication);

			//build grid
			var columns = [{
				// name is a required parameter, but you don't really want one on a select all column
				name: "",
				// Backgrid.Extension.SelectRowCell lets you select individual rows
				cell: "select-row"
			}, {
				name: "publicationType",
				label: "Type", // The name to display in the header
				editable: false, // By default every cell in a column is editable
				cell: "string",
				formatter: _.extend({}, Backgrid.StringFormatter.prototype, {
					fromRaw: function (rawValue, model) {
						return rawValue ? rawValue.text: '';
					}
				})
			}, {
				name: "seriesTitle",
				label: "USGS Series",
				editable: false,
				cell: "string",
				formatter: _.extend({}, Backgrid.StringFormatter.prototype, {
					fromRaw: function (rawValue, model) {
						return rawValue ? rawValue.text: '';
					}
				})
			}, {
				name: "seriesNumber",
				label: "Report Number",
				editable: false,
				cell: "string"
			}, {
				name: "publicationYear",
				label: "Year",
				editable: false,
				cell: "string"
//					cell: Backgrid.StringCell.extend({ tagName: 'td style="text-align: center"' })
//					cell: Backgrid.StringCell.extend({
//						render: function () {
//							this.$el.css('text-align','center');
//							return this;
//						}
//					})
			}, {
				name: "title",
				label: "  Title",
				editable: false,
				cell: "string"
			}];

			// Initialize a new Grid instance
			this.grid = new Backgrid.Grid({
				columns: columns,
				collection: this.publicationList
			});

			this.fetchPromise = this.publicationList.fetch();

			// Create child views
			this.alertView = new AlertView({
				el: '.alert-container'
			});
		},

		remove : function() {
			this.alertView.remove();
			BaseView.prototype.remove.apply(this, arguments);
			return this;
		},

		editPublication : function(ev) {
			this.router.navigate('publication/' + ev.id, {trigger: true});
		}

	});

	return view;
});