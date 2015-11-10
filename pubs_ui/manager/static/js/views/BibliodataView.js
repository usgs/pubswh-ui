/* jslint browser: true */

define([
	'handlebars',
	'jquery',
	'select2',
	'backbone.stickit',
	'models/PublicationTypeCollection',
	'views/BaseView',
	'text!hb_templates/bibliodata.hbs',
	'module'
], function(Handlebars, $, select2, stickit, PublicationTypeCollection, BaseView, hbTemplate, module) {
	"use strict";

	var view = BaseView.extend({

		// Because we are using select2 for the menus, we need to use the select2:select and select2:unselect events to update
		// the model. We can't use the change event because we must trigger this event when programatically updating the view to r
		// reflect the model value. Also the corresponding option must exist in order for a selection to be shown.

		events : {
			'select2:select #pub-type-input' : 'selectPubType',
			'select2:unselect #pub-type-input' : 'resetPubType',
			'select2:select #pub-subtype-input' : 'selectPubSubtype',
			'select2:unselect #pub-subtype-input' : 'resetPubSubtype'
		},

		bindings : {
			'#subseries-input' : 'subseriesTitle',
			'#series-number-input' : 'seriesNumber',
			'#chapter-input' : 'chapter',
			'#subchapter-input' : 'subchapterNumber',
			'#title-input' : 'title',
			'#docAbstract-input' : 'docAbstract',
			'#usgs-citation-input' : 'usgsCitation',
			'#collaboration-input' : 'collaboration',
			'#larger-work-title-input' : 'largerWorkTitle',
			'#language-input' : 'language',
			'#publisher-input' : 'publisher',
			'#publisher-location-input' : 'publisherLocation',
			'#publication-year-input' : 'publicationYear',
			'#conference-title-input' : 'conferenceTitle',
			'#conference-date-input' : 'conferenceDate',
			'#conference-location-input' : 'conferenceLocation',
			'#doi-input' : 'doi',
			'#issn-input' : 'issn',
			'#isbn-input' : 'isbn',
			'#tableOfContents-input' : 'tableOfContents',
			'#update-date-input' : 'lastModifiedDate'
		},

		template : Handlebars.compile(hbTemplate),

		optionTemplate : Handlebars.compile('<option value={{id}}>{{text}}</option>'),

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(this, arguments);

			// Sets up the binding between DOM elements and the model //
			this.stickit();
			this.$('#pub-type-input').select2({
				allowClear: true
			});
			this.$('#pub-subtype-input').select2({
				allowClear : true,
				ajax : {
					url : module.config().lookupUrl + 'publicationsubtypes',
					data : function(params) {
						return {
							mimetype : 'json',
							publicationtypeid : self.model.get('publicationType').id
						}
					},
					processResults : function(data) {
						return {
							results : data
						};
					}
				}
			});
			this.pubTypePromise.done(function() {
				var $select = self.$('#pub-type-input');
				var options = self.publicationTypeCollection.map(function(m) {
					return self.optionTemplate(m.attributes);
				});
				$select.html(options.join(''));
				self.updatePubType();
			});
		},

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.listenTo(this.model, 'change:publicationType', this.updatePubType);
			this.listenTo(this.model, 'change:publicationSubtype', this.updatePubSubtype);

			this.publicationTypeCollection = new PublicationTypeCollection();
			this.pubTypePromise = this.publicationTypeCollection.fetch();
		},

		selectPubType : function(ev) {
			var selected = $(ev.currentTarget).val();
			var selectedText = ev.currentTarget.selectedOptions[0].innerHTML;
			this.model.set('publicationType', {id: selected, text : selectedText});
			this.model.unset('publicationSubtype');
		},

		resetPubType : function(ev) {
			this.model.unset('publicationType');
			this.model.unset('publicationSubtype');
		},

		selectPubSubtype : function(ev) {
			var selected = $(ev.currentTarget).val();
			var selectedText = ev.currentTarget.selectedOptions[0].innerHTML;
			this.model.set('publicationSubtype', {id: selected});
		},

		resetPubSubtype : function(ev) {
			this.model.unset('publicationSubtype');
		},

		updatePubType : function() {
			var $select = this.$('#pub-type-input');
			var pubType = this.model.get('publicationType');

			if (_.has(pubType, 'id')) {
				$select.val(pubType.id).trigger('change');
			}
			else {
				$select.val('').trigger('change');
			}
		},

		updatePubSubtype : function() {
			var pubSubtype = this.model.get('publicationSubtype');
			var $select = this.$('#pub-subtype-input');
			if (_.has(pubSubtype, 'id')) {
				if ($select.find('option[value="' + pubSubtype.id + '"]').length === 0) {
					$select.append(this.optionTemplate(pubSubtype));
				}
				$select.val(pubSubtype.id).trigger('change');
			}
			else {
				$select.val('').trigger('change');
			}
		}

	});

	return view;
});