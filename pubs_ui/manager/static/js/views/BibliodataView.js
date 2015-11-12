/* jslint browser: true */

define([
	'handlebars',
	'jquery',
	'select2',
	'tinymce',
	'module',
	'backbone.stickit',
	'models/PublicationTypeCollection',
	'models/CostCenterCollection',
	'views/BaseView',
	'hbs!hb_templates/bibliodata',
], function(Handlebars, $, select2, tinymce, module, stickit, PublicationTypeCollection, CostCenterCollection, BaseView, hbTemplate) {
	"use strict";

	var view = BaseView.extend({

		// Because we are using select2 for the menus, we need to use the select2:select and select2:unselect events to update
		// the model. We can't use the change event because we must trigger this event when programatically updating the view to
		// reflect the model value.

		events : {
			'select2:select #pub-type-input' : 'selectPubType',
			'select2:unselect #pub-type-input' : 'resetPubType',
			'select2:select #pub-subtype-input' : 'selectPubSubtype',
			'select2:unselect #pub-subtype-input' : 'resetPubSubtype',
			'select2:select #series-title-input' : 'selectSeriesTitle',
			'select2:unselect #series-title-input' : 'resetSeriesTitle',
			'select2:select #cost-centers-input' : 'selectCostCenter',
			'select2:unselect #cost-centers-input' : 'unselectCostCenter',
			'select2:select #larger-work-type-input' : 'selectLargerWorkType',
			'select2:unselect #larger-work-type-input' : 'resetLargerWorkType',
			'select2:select #larger-work-subtype-input' : 'selectLargerWorkSubtype',
			'select2:unselect #larger-work-subtype-input' : 'resetLargerWorkSubtype'
		},

		bindings : {
			'#subseries-input' : 'subseriesTitle',
			'#series-number-input' : 'seriesNumber',
			'#chapter-input' : 'chapter',
			'#subchapter-input' : 'subchapterNumber',
			'#title-input' : 'title',
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
			'#update-date-input' : 'lastModifiedDate'
		},

		template : hbTemplate,

		optionTemplate : Handlebars.compile('<option value={{id}}>{{text}}</option>'),

		/*
		 * @constructs
		 * @param {Object} options
		 *      @prop {PublicationModel} model
		 *      @prop {String} el - jquery selector where this view is rendered
		 */
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			// Retrieve lookups for publication types and cost centers
			this.publicationTypeCollection = new PublicationTypeCollection();
			this.pubTypePromise = this.publicationTypeCollection.fetch();

			this.activeCostCenters = new CostCenterCollection();
			this.notActiveCostCenters = new CostCenterCollection();
			this.costCenterPromise = $.when(
					this.activeCostCenters.fetch({data : {active : 'y'}}),
					this.notActiveCostCenters.fetch({data : {active : 'n'}})
			);

			// Add binding from model to dom for select2's and tinymce elements which are not handled by stickit.
			this.listenTo(this.model, 'change:publicationType', this.updatePubType);
			this.listenTo(this.model, 'change:publicationSubtype', this.updatePubSubtype);
			this.listenTo(this.model, 'change:seriesTitle', this.updateSeriesTitle);
			this.listenTo(this.model, 'change:costCenters', this.updateCostCenters);
			this.listenTo(this.model, 'change:largerWorkType', this.updateLargerWorkType);
			this.listenTo(this.model, 'change:largerWorkSubtype', this.updateLargerWorkSubtype);
			this.listenTo(this.model, 'change:docAbstract', this.updateDocAbstract);
			this.listenTo(this.model, 'change:tableOfContents', this.updateTableOfContents);
		},

		render : function() {
			var self = this;
			BaseView.prototype.render.apply(this, arguments);

			// Sets up the binding between DOM elements and the model //
			this.stickit();

			// Set up tinymce elements
			this.updateDocAbstract();
			tinymce.init({
				selector : '#docAbstract-input',
				setup : function (ed) {
          			ed.on('change', function(ev) {
						self.model.set('docAbstract', ev.level.content);
          			});
   				},
				menubar: false,
				plugins : 'code link paste',
				formats: {
						italic: {inline: 'i'}
					},
				browser_spellcheck : true,
				toolbar : 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | subscript superscript | link | code',
				valid_elements : "@[id|class|title|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|"
						+ "onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|"
						+ "onkeydown|onkeyup],a[rel|rev|charset|hreflang|tabindex|accesskey|type|"
						+ "name|href|target|title|class|onfocus|onblur],strong/b,i/em,strike,u,"
						+ "#p,-ol[type|compact],-ul[type|compact],-li,br,img[longdesc|usemap|"
						+ "src|border|alt=|title|hspace|vspace|width|height|align],-sub,-sup,"
						+ "-blockquote,-table[border=0|cellspacing|cellpadding|width|frame|rules|"
						+ "height|align|summary|bgcolor|background|bordercolor],-tr[rowspan|width|"
						+ "height|align|valign|bgcolor|background|bordercolor],tbody,thead,tfoot,"
						+ "#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor"
						+ "|scope],#th[colspan|rowspan|width|height|align|valign|scope],caption,-div,"
						+ "-span,-code,-pre,address,-h1,-h2,-h3,-h4,-h5,-h6,hr[size|noshade],-font[face"
						+ "|size|color],dd,dl,dt,cite,abbr,acronym,del[datetime|cite],ins[datetime|cite],"
						+ "object[classid|width|height|codebase|*],param[name|value|_value],embed[type|width"
						+ "|height|src|*],script[src|type],map[name],area[shape|coords|href|alt|target],bdo,"
						+ "button,col[align|char|charoff|span|valign|width],colgroup[align|char|charoff|span|"
						+ "valign|width],dfn,fieldset,form[action|accept|accept-charset|enctype|method],"
						+ "input[accept|alt|checked|disabled|maxlength|name|readonly|size|src|type|value],"
						+ "kbd,label[for],legend,noscript,optgroup[label|disabled],option[disabled|label|selected|value],"
						+ "q[cite],samp,select[disabled|multiple|name|size],small,"
						+ "textarea[cols|rows|disabled|name|readonly],tt,var,big"
			});

			this.updateTableOfContents();
			tinymce.init({
				selector : '#tableOfContents-input',
				setup : function(ed) {
					ed.on('change', function(ev) {
						self.model.set('tableOfContents', ev.level.content);
					});
				},
				menubar: false,
				plugins : 'code link paste',
				formats: {
						italic: {inline: 'i'}
					},
				browser_spellcheck : true,
				toolbar : 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | subscript superscript | link | code'
			});

			// Set up for the publication type and larger work type select2's. These are set up once the data for the options
			// have been retrieved.
			this.pubTypePromise.done(function() {
				self.$('#pub-type-input').select2({
					allowClear: true,
					data: self.publicationTypeCollection.toJSON()
				});
				self.updatePubType();

				self.$('#larger-work-type-input').select2({
					allowClear : true,
					data : self.publicationTypeCollection.toJSON()
				});
				self.updateLargerWorkType();
			});

			// Set up for the cost center select2's. These are set up once the data for the options have been retrieved.
			this.costCenterPromise.done(function() {
				self.$('#cost-centers-input').select2({
					allowClear : true,
					data : [{
						text : 'Active',
						children : self.activeCostCenters.toJSON()
					}, {
						text : 'Not Active',
						children : self.notActiveCostCenters.toJSON()
					}]
				});
				self.updateCostCenters();
			});


			// The remaining select2's dynamically fetch their options using the lookup service, the current text search term
			// and optionally filtered by a model attribute value.
			this.$('#pub-subtype-input').select2({
				allowClear : true,
				ajax : {
					url : module.config().lookupUrl + 'publicationsubtypes',
					data : function(params) {
						var result = {
							mimetype : 'json',
							publicationtypeid : self.model.get('publicationType').id
						};
						if (_.has(params, 'term')) {
							result.text = params.term;
						}
						return result;
					},
					processResults : function(data) {
						return {
							results : data
						};
					}
				}
			});
			this.updatePubSubtype();

			// This is a special case where two lookup's are needed to fetch the active and not active values.
			// To do this, we redefined the transport function to make the two ajax calls, returning a
			// deferred which is resolved after both calls are done.
			this.$('#series-title-input').select2({
				allowClear : true,
				ajax : {
					url : module.config().lookupUrl + 'publicationseries',
					data : function(params) {
						var result =  {
							mimetype : 'json',
							publicationsubtypeid : self.model.get('publicationSubtype').id,
							active : ''
						};
						if (_.has(params, 'term')) {
							result.text = params.term;
						}
						return result;
					},
					transport : function(params, success, failure) {
						var deferred = $.Deferred();
						params.data.active = 'y';
						var activeRequest = $.ajax(params);
						params.data.active = 'n';
						var notActiveRequest = $.ajax(params);

						$.when(activeRequest, notActiveRequest).always(function(activeResults, notActiveResults) {
							deferred.resolve([activeResults, notActiveResults]);
						});
						deferred.done(success);
						deferred.fail(failure);

						return deferred;
					},
					processResults : function(data) {
						var results = {
							results : [{
								text : 'Active',
								children : []
							},{
								text : 'Not Active',
								children : []
							}]
						};
						if ((data.length === 2) && (data[0].length === 3) && (data[1].length === 3)) {
							results.results[0].children = data[0][0].slice(0, 30);
							results.results[1].children = data[1][0].slice(0, 30);
						}
						return results;
					}
				}
			});
			this.updateSeriesTitle();

			this.$('#larger-work-subtype-input').select2({
				allowClear : true,
				ajax : {
					url : module.config().lookupUrl + 'publicationsubtypes',
					data : function(params) {
						var result = {
							mimetype : 'json',
							publicationtypeid : self.model.get('largerWorkType').id
						};
						if (_.has(params, 'term')) {
							result.text = params.term;
						}
						return result;
					},
					processResults : function(data) {
						return {
							results : data
						};
					}
				}
			});
			this.updateLargerWorkSubtype();

			return this;
		},

		/*
		 * Event handlers for select and reset events for the select2s
		 */
		selectPubType : function(ev) {
			var selected = ev.currentTarget.value;
			var selectedText = ev.currentTarget.selectedOptions[0].innerHTML;
			this.model.set('publicationType', {id: selected, text : selectedText});
			this.model.unset('publicationSubtype');
			this.model.unset('seriesTitle');
		},

		resetPubType : function(ev) {
			this.model.unset('publicationType');
			this.model.unset('publicationSubtype');
			this.model.unset('seriesTitle');
		},

		selectPubSubtype : function(ev) {
			var selected = ev.currentTarget.value;
			var selectedText = ev.currentTarget.selectedOptions[0].innerHTML;
			this.model.set('publicationSubtype', {id: selected, text : selectedText});
			this.model.unset('seriesTitle');
		},

		resetPubSubtype : function(ev) {
			this.model.unset('publicationSubtype');
			this.model.unset('seriesTitle');
		},

		selectSeriesTitle : function(ev) {
			var selected = ev.currentTarget.value;
			var selectedText = ev.currentTarget.selectedOptions[0].innerHTML;
			this.model.set('seriesTitle', {id : selected, text : selectedText});
		},

		resetSeriesTitle : function(ev) {
			this.model.unset('seriesTitle');
		},

		selectCostCenter : function(ev) {
			var costCenters = _.clone(this.model.get('costCenters'));
			costCenters.push({
				id : parseInt(ev.params.data.id),
				text : ev.params.data.text
			});
			this.model.set('costCenters', costCenters);
		},

		unselectCostCenter : function(ev) {
			var costCenters = _.clone(this.model.get('costCenters'));
			var ccToRemove = parseInt(ev.params.data.id);

			this.model.set('costCenters', _.reject(costCenters, function(cc) {
				return cc.id === ccToRemove;
			}));
		},

		selectLargerWorkType : function(ev) {
			var selected = ev.currentTarget.value;
			var selectedText = ev.currentTarget.selectedOptions[0].innerHTML;
			this.model.set('largerWorkType', {id: selected, text : selectedText});
			this.model.unset('largerWorkSubtype');
		},

		resetLargerWorkType : function(ev) {
			this.model.unset('largerWorkType');
			this.model.unset('largerWorkSubtype');
		},

		selectLargerWorkSubtype : function(ev) {
			var selected = ev.currentTarget.value;
			var selectedText = ev.currentTarget.selectedOptions[0].innerHTML;
			this.model.set('largerWorkSubtype', {id: selected, text : selectedText});
		},

		resetLargerWorkSubtype : function(ev) {
			this.model.unset('largerWorkSubtype');
		},

		/*
		 * Model attribute change handlers for inputs handled by select2's and tinymce rather than stickit.
		 * Note that for select2's where the data is retrieved remotely using the ajax option, when setting
		 * the value we must also create the corresponding option tags
		 */
		updatePubType : function() {
			var $select = this.$('#pub-type-input');
			var $subtypeSelect = this.$('#pub-subtype-input');

			var pubType = this.model.get('publicationType');
			var hasId = _.has(pubType, 'id');

			if (hasId) {
				$select.val(pubType.id).trigger('change');
			}
			else {
				$select.val('').trigger('change');
			}
			$subtypeSelect.prop('disabled', !hasId);
		},

		updatePubSubtype : function() {
			var $select = this.$('#pub-subtype-input');
			var $seriesTitleSelect = this.$('#series-title-input');

			var pubSubtype = this.model.get('publicationSubtype');
			var hasId = _.has(pubSubtype, 'id');

			if (hasId) {
				if ($select.find('option[value="' + pubSubtype.id + '"]').length === 0) {
					$select.append(this.optionTemplate(pubSubtype));
				}
				$select.val(pubSubtype.id).trigger('change');
			}
			else {
				$select.val('').trigger('change');
			}
			$seriesTitleSelect.prop('disabled', !hasId);
		},

		updateSeriesTitle : function() {
			var $select = this.$('#series-title-input');
			var seriesTitle = this.model.get('seriesTitle');

			if (_.has(seriesTitle, 'id')) {
				if ($select.find('option[value="' + seriesTitle.id + '"]').length === 0) {
					$select.append(this.optionTemplate(seriesTitle));
				}
				$select.val(seriesTitle.id).trigger('change');
			}
			else {
				$select.val('').trigger('change');
			}
		},

		updateCostCenters : function() {
			var $select = this.$('#cost-centers-input');
			var costCenters = this.model.get('costCenters');
			if (_.isEmpty(costCenters)) {
				$select.val('').trigger('change');
			}
			else {
				$select.val(_.pluck(costCenters, 'id')).trigger('change');
			}
		},

		updateLargerWorkType : function() {
			var $select = this.$('#larger-work-type-input');
			var $subtypeSelect = this.$('#larger-work-subtype-input');

			var largerWorkType = this.model.get('largerWorkType');
			var hasId = _.has(largerWorkType, 'id');

			if (hasId) {
				$select.val(largerWorkType.id).trigger('change');
			}
			else {
				$select.val('').trigger('change');
			}
			$subtypeSelect.prop('disabled', !hasId);
		},

		updateLargerWorkSubtype : function() {
			var $select = this.$('#larger-work-subtype-input');

			var largerWorkSubtype = this.model.get('largerWorkSubtype');
			var hasId = _.has(largerWorkSubtype, 'id');

			if (hasId) {
				if ($select.find('option[value="' + largerWorkSubtype.id + '"]').length === 0) {
					$select.append(this.optionTemplate(largerWorkSubtype));
				}
				$select.val(largerWorkSubtype.id).trigger('change');
			}
			else {
				$select.val('').trigger('change');
			}
		},

		updateDocAbstract : function() {
			this.$('#docAbstract-input').html(this.model.get('docAbstract'));
		},

		updateTableOfContents : function() {
			this.$('#tableOfContents-input').html(this.model.get('tableOfContents'));
		}

	});

	return view;
});