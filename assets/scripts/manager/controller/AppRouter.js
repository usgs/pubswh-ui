import $ from 'jquery';
import Backbone from 'backbone';

import ManagePublicationsView from '../views/ManagePublicationsView';
import PublicationView from '../views/PublicationView';
import ManageContributorsView from '../views/ManageContributorsView';
import EditSeriesTitleView from '../views/EditSeriesTitleView';
import ManageAffiliationView from '../views/ManageAffiliationView';
import PublicationModel from '../models/PublicationModel';
import PublicationCollection from '../models/PublicationCollection';
import ContributorModel from '../models/ContributorModel';
import SeriesTitleModel from '../models/SeriesTitleModel';
import AffiliationModel from '../models/AffiliationModel';


export default Backbone.Router.extend({
    routes: {
        '': 'managePublicationsView',
        'search' : 'managePublicationsView',
        'publication' : 'publicationView',
        'publication/:pubId' : 'publicationView',
        'contributor' : 'manageContributorsView',
        'contributor/:contribId' : 'manageContributorsView',
        'seriesTitle' : 'editSeriesTitleView',
        'seriesTitle/:seriesTitleId' : 'editSeriesTitleView',
        'affiliation' : 'manageAffiliationView',
        'affiliation/:affiliationId' : 'manageAffiliationView'
    },

    applicationContextDiv: '#main-content',

    /*
     * Create a view a put in in the applicationContextDiv. This view becomes the router's currentView
     * @param {Backbone.View} View - The view to create
     * @param {Object} opts - options to use when creating the view
     */
     createView: function (View, opts) {
        var newEl = $('<div />');

        this.removeCurrentView();
        $(this.applicationContextDiv).append(newEl);
        this.currentView = new View($.extend({
            el: newEl,
            router: this
        }, opts));

        return this.currentView;
    },

    /*
     * Remove the currentView
     */
     removeCurrentView: function () {
        if (this.currentView) {
            this.currentView.remove();
        }
    },

    managePublicationsView: function () {
        var searchFilters = window.sessionStorage.searchFilters ? JSON.parse(window.sessionStorage.searchFilters) : {};
        var collection = new PublicationCollection();
        var filterModel = new Backbone.Model(searchFilters);

        this.createView(ManagePublicationsView, {
            collection : collection,
            model : filterModel
        }).render();
    },

    publicationView : function(pubId) {
        var model = new PublicationModel();
        if (pubId) {
            model.set('id', pubId);
        }

        this.createView(PublicationView, {
            model : model
        }).render();
    },

    manageContributorsView : function(contribId) {
        var model = new ContributorModel();
        if (contribId) {
            model.set('contributorId', contribId);
        }

        this.createView(ManageContributorsView, {
            model : model
        }).render();
    },

    editSeriesTitleView : function(seriesTitleId) {
        var model = new SeriesTitleModel();
        if (seriesTitleId) {
            model.set('id', seriesTitleId);
        }
        this.createView(EditSeriesTitleView, {
            model : model
        }).render();
    },

    manageAffiliationView : function(affiliationId) {
        var model = new AffiliationModel();
        if (affiliationId) {
            model.set('id', affiliationId);
        }
        this.createView(ManageAffiliationView, {
            model : model
        }).render();
    }
});
