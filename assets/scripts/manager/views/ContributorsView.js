import 'backbone.stickit';

import each from 'lodash/each';

import ContributorTypeCollection from '../models/ContributorTypeCollection';
import PublicationContributorCollection from '../models/PublicationContributorCollection';
import BaseView from './BaseView';
import ContributorTabView from './ContributorTabView';
import hbTemplate from '../hb_templates/contributors.hbs';


export default BaseView.extend({

    events : {
        'click .contributor-types-tabs' : 'showTab'
    },

    bindings : {
        '#no-usgs-authors-input' : 'noUsgsAuthors'
    },

    template : hbTemplate,

    /*
     * @constructs
     * @param {Object} options
     *     @prop {String} el - jquery selector where this view is rendered
     *     @prop {Backbone.Model} model - assumes that model be a PublicationModel
     */
     initialize : function() {
        var self = this;
        var contributors = this.model.get('contributors');
        var fetchDeferred = $.Deferred();
        BaseView.prototype.initialize.apply(this, arguments);

        this.contributorTypeCollection = new ContributorTypeCollection();
        this.contributorTypeCollection.fetch().always(function() {
            self.typeTabViews = self.contributorTypeCollection.map(function(model) {
                var typeProp = model.attributes.text.toLowerCase();
                if (!contributors.has(typeProp)) {
                    contributors.set(typeProp, new PublicationContributorCollection());
                }

                return {
                    el : '#type-' + model.get('id') + '-pane',
                    view : new ContributorTabView({
                        collection : contributors.get(typeProp),
                        contributorType : model.attributes,
                        el : '#type-' + model.get('id') + '-pane'
                    })
                };
            });

            fetchDeferred.resolve();
        });
        this.createTabViewsPromise = fetchDeferred.promise();
    },

    render : function() {
        var self = this;
        this.createTabViewsPromise.done(function() {
            self.context.contributorTypes = self.contributorTypeCollection.toJSON();
            BaseView.prototype.render.apply(self, arguments);
            self.stickit();
            each(self.typeTabViews, function(tab) {
                tab.view.setElement(tab.el).render();
            });
        });
    },

    remove : function() {
        each(this.typeTabViews, function(tab) {
            tab.view.remove();
        });
        BaseView.prototype.remove.apply(this, arguments);
    },

    showTab : function(ev) {
        ev.preventDefault();
        this.$('.contributor-types-tabs').tab('show');
    }
});
