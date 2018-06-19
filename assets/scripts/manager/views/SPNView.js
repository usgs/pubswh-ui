define([
    'jquery',
    'underscore',
    'eonasdan-bootstrap-datetimepicker',
    'select2',
    'tinymce',
    'backbone.stickit',
    '../utils/DynamicSelect2',
    '../models/PublishingServiceCenterCollection',
    './BaseView',
    '../hb_templates/spn.hbs',
    '../hb_templates/spnOption.hbs'
], function($, _, datetimepicker, select2, tinymce, stickit,
            DynamicSelect2, PublishingServiceCenterCollection, BaseView, hbTemplate, optionTemplate) {
    var view = BaseView.extend({

        template : hbTemplate,

        optionTemplate : optionTemplate,

        events : {
            'select2:select #is-part-of-input' : 'selectIsPartOf',
            'select2:unselect #is-part-of-input' : 'resetIsPartOf',
            'select2:select #superseded-by-input' : 'selectSupersededBy',
            'select2:unselect #superseded-by-input' : 'resetSupersededBy',
            'select2:select #psc-input' : 'selectPSC',
            'select2:unselect #psc-input' : 'resetPSC',
            // To set the model value from a datetimepicker, handle the event of the input's div
            'dp.change #published-date-input-div' : 'changePublishedDate',
            'dp.change #revised-date-input-div' : 'changeRevisedDate'
        },

        bindings : {
            '#published-date-input' : 'publishedDate',
            '#revised-date-input' : 'revisedDate'
        },

        /*
         * @constructs
         * @param {Object} options
         *     @prop {String} el - jquery selector where view will be rendered
         *     @prop {PublicationModel} model
         */
        initialize : function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.serviceCenterCollection = new PublishingServiceCenterCollection();
            this.serviceCenterPromise = this.serviceCenterCollection.fetch();

            this.listenTo(this.model, 'change:isPartOf', this.updateIsPartOf);
            this.listenTo(this.model, 'change:supersededBy', this.updateSupersededBy);
            this.listenTo(this.model, 'change:publishingServiceCenter', this.updatePSC);
            this.listenTo(this.model, 'change:contact', this.updateContact);
        },

        render : function() {
            var self = this;
            var DEFAULT_SELECT2_OPTIONS = {
                allowClear : true,
                theme : 'bootstrap'
            };

            BaseView.prototype.render.apply(this, arguments);

            // Set up datepickers
            this.$('#published-date-input-div').datetimepicker({
                format : 'YYYY-MM-DD'
            });

            this.$('#revised-date-input-div').datetimepicker({
                format : 'YYYY-MM-DD'
            });


            this.stickit();

            this.updateContact();

            // Set up static select2's once their options have been fetched
            this.serviceCenterPromise.done(function() {
                self.$('#psc-input').select2(_.extend({
                    data : self.serviceCenterCollection.toJSON()
                }, DEFAULT_SELECT2_OPTIONS));
                self.updatePSC();
            });

            // Initialize dynamic select2's.
            this.$('#is-part-of-input').select2(DynamicSelect2.getSelectOptions({
                lookupType: 'publications'
            }, DEFAULT_SELECT2_OPTIONS));
            this.updateIsPartOf();

            this.$('#superseded-by-input').select2(DynamicSelect2.getSelectOptions({
                lookupType: 'publications'
            }, DEFAULT_SELECT2_OPTIONS));
            this.updateSupersededBy();

            return this;
        },

        /*
         * @returns Jquery.Promise which is resolved once the tinymce editor has been successfully initialized.
         */
        initializeTinyMce : function() {
            //Set up tinymce element. If the setup
            // callback is not called, the app should try again after removing and adding back in the editor.
            // This is the only way I got the tinymce editor to reliably render.
            var self = this;
            var deferred = $.Deferred();
            var isInit = false;
            var interval = window.setInterval(function() {
                if (isInit) {
                    tinymce.execCommand('mceRemoveEditor', true, 'contacts-input');
                    tinymce.execCommand('mceAddEditor', true, 'contacts-input');
                }
                tinymce.init({
                    selector : '#contacts-input',
                    setup : function(ed) {
                        deferred.resolve();
                        window.clearInterval(interval);
                        ed.on('change', function(ev) {
                            self.model.set('contact', ev.level.content);
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
                isInit = true;
            }, 1);

            return deferred.promise();
        },

        /*
         * DOM event handlers
         */

        _setSelect2 : function(ev, modelProp) {
            var selected = ev.currentTarget.value;
            var selectedText = ev.currentTarget.selectedOptions[0].innerHTML;
            this.model.set(modelProp, {id : selected, text : selectedText});
        },

        selectIsPartOf : function(ev) {
            this._setSelect2(ev, 'isPartOf');
        },
        resetIsPartOf : function() {
            this.model.unset('isPartOf');
        },

        selectSupersededBy : function(ev) {
            this._setSelect2(ev, 'supersededBy');
        },
        resetSupersededBy : function() {
            this.model.unset('supersededBy');
        },

        selectPSC : function(ev) {
            this._setSelect2(ev, 'publishingServiceCenter');
        },
        resetPSC : function() {
            this.model.unset('publishingServiceCenter');
        },

        changePublishedDate : function(ev) {
            if (ev.date) {
                this.model.set('publishedDate', ev.date.format('YYYY-MM-DD'));
            } else {
                this.model.unset('publishedDate');
            }
        },

        changeRevisedDate : function(ev) {
            if (ev.date) {
                this.model.set('revisedDate', ev.date.format('YYYY-MM-DD'));
            } else {
                this.model.unset('revisedDate');
            }
        },

        /*
         * Model event handlers
         */

        _updateDynamicSelect2 : function(selector, modelProp) {
            var $select = this.$(selector);
            var value = this.model.get(modelProp);

            if (_.has(value, 'id')) {
                if ($select.find('option[value="' + value.id + '"]').length === 0) {
                    $select.append(this.optionTemplate(value));
                }
                $select.val(value.id).trigger('change');
            } else {
                $select.val('').trigger('change');
            }
        },
        updateIsPartOf : function() {
            this._updateDynamicSelect2('#is-part-of-input', 'isPartOf');
        },
        updateSupersededBy : function() {
            this._updateDynamicSelect2('#superseded-by-input', 'supersededBy');
        },
        updatePSC : function() {
            var $select = this.$('#psc-input');
            var value = this.model.get('publishingServiceCenter');
            $select.val(_.has(value, 'id') ? value.id : '').trigger('change');
        },
        updateContact : function() {
            this.$('#contacts-input').html(this.model.get('contact'));
        }
    });


    return view;
});
