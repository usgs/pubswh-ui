import _ from 'underscore';
import $ from 'jquery';
import log from 'loglevel';

import BaseView from './BaseView';
import ContributorRowView from './ContributorRowView';
import hb_template from '../hb_templates/contributorTab.hbs';


export default BaseView.extend({

    events : {
        'click .add-btn' : 'addNewRow',
        'click .manage-contrib-btn' : 'openManageContributorWindow'
    },

    template : hb_template,

    /*
     * @constructs - view representing a collection of contributors for a contributor type.
     * @param {Object} options
     *     @prop {PublicationContributorCollection} collection
     *     @prop {Object} contributorType - with id and text properties
     *     @prop {String} el - jquery selector where the view will be rendered.
     */
    initialize : function(options) {
        var self = this;
        BaseView.prototype.initialize.apply(this, arguments);
        this.contributorType = options.contributorType;
        this.renderDeferred = $.Deferred();

        this.rowViews = this.collection.map(function(model) {
            return  new ContributorRowView({
                el : '.grid',
                model : model,
                collection : self.collection
            });
        });

        this.listenTo(this.collection, 'add', this.addRow);
        this.listenTo(this.collection, 'remove', this.removeRow);
        this.listenTo(this.collection, 'update', this.updateRowOrder);
    },

    render : function() {
        var self = this;
        BaseView.prototype.render.apply(this, arguments);
        this.$('.grid').sortable({
            stop : function(event, ui) {
                log.debug('Updating contributor rank with index ' + ui.item.index());
                ui.item.find('.contributor-row-container').trigger('updateOrder', ui.item.index());
            }
        });
        this.rowViews = _.chain(this.rowViews)
        .sortBy(function(view) {
            return view.model.get('rank');
        })
        .each(function(view) {
            self.renderViewRow(view);
        })
        .value();
        this.renderDeferred.resolve();
    },

    remove : function() {
        _.each(this.rowViews, function(view) {
            view.remove();
        });

        BaseView.prototype.remove.apply(this, arguments);
        return this;
    },

    /*
     * Local method used to render a contributor row view
     * @param {ContributorRowView} rowView
     */
     renderViewRow : function(rowView) {
        var $grid = this.$('.grid');
        var divText = '<div class="contributor-row-div"></div>';

        $grid.append(divText);
        rowView.setElement($grid.find('.contributor-row-div:last-child')).render();
    },

    /*
     * DOM event handler to add a new contributor row
     */
    addNewRow : function() {
        var newModel = new this.collection.model({
            contributorType : this.contributorType,
            rank : this.rowViews.length + 1
        });

        this.collection.add(newModel);
    },

    openManageContributorWindow : function() {
        var h = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + window.location.pathname + '#contributor';
        window.open(h, '_blank');
    },

    /*
     * collection event handlers
     */
    addRow : function(model) {
        var newView = new ContributorRowView({
            model: model,
            el: '.grid',
            collection : this.collection
        });

        this.rowViews.push(newView);

        if (this.renderDeferred.state() === 'resolved') {
            this.renderViewRow(newView);
        }
    },

    removeRow : function(model) {
        var viewToRemove = _.findWhere(this.rowViews, {model : model});

        if (viewToRemove) {
            viewToRemove.remove();
            this.rowViews = _.reject(this.rowViews, function(view) {
                return view === viewToRemove;
            });
        }
    },

    updateRowOrder : function() {
        var $grid = this.$('.grid');

        this.rowViews = _.chain(this.rowViews)
            // Sort row views and them move them by successively appending them to the grid.
            .sortBy(function(view) {
                return view.model.attributes.rank;
            })
            .each(function(view) {
                view.$el.appendTo($grid);
            })
            .value();
        }
    });
