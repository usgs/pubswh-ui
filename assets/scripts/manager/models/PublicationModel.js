import _ from 'underscore';
import $ from 'jquery';
import Backbone from 'backbone';

import LinkCollection from './LinkCollection';
import PublicationContributorCollection from './PublicationContributorCollection';


export default Backbone.Model.extend({
    urlRoot : window.CONFIG.scriptRoot + '/manager/services/mppublications',

    /*
     * The contributors attribute is a backbone model. This model contains attributes whose value
     * is a PublicationContributorCollection.
     */
     defaults : function() {
        return {
            links: new LinkCollection(),
            contributors : new Backbone.Model()
        };
    },

    parse : function(response) {
        var links = this.has('links') ? this.get('links') : new LinkCollection();
        var contributors = this.has('contributors') ? this.get('contributors') : new Backbone.Model();
        if (_.has(response, 'links') && response.links.length) {
            links.set(_.sortBy(response.links, 'rank'));
        } else {
            links.reset(null);
        }
        response.links = links;

        if (_.has(response, 'contributors')) {
            _.each(contributors.keys, function(contribType) {
                // Clear out collection if response doesn't contain the contribType
                if (!_.has(response.contributors, contribType)) {
                    contributors.unset(contribType);
                }
            });
            _.each(response.contributors, function(contribs, contribType) {
                if (contributors.has(contribType)){
                    var collection = contributors.get(contribType);
                    collection.set(contribs);
                    collection.sort();
                } else {
                    contributors.set(contribType, new PublicationContributorCollection(contribs));
                }
            });

        } else {
            _.each(contributors.attributes, function(value, contribType) {
                var contribTypeCollection = contributors.get(contribType);
                contribTypeCollection.reset();
            });
        }
        response.contributors = contributors;

        /*
            Need to remove interactions and text to work around an issue with some properties being returned that shouldn't be.
            When PUBSTWO-1272 has been resolved, this code can be removed.
            */
            return _.omit(response, ['interactions', 'text']);
        },

        fetch : function(options) {
            var params = {
                data : {
                    mimetype : 'json'
                }
            };
            if (_.isObject(options)) {
                _.extend(params, options);
            }
            return Backbone.Model.prototype.fetch.call(this, params);
        },

    /*
     * @param {String} op - command that will be added to the url to perform an action on the pub
     * @return {Jquery.Promise} - If the model is empty, resolves returning nothing. If not emtpy,
     *     resolves with the received response if call succeeds, rejects with the validationErrors
     *     array if the response contains validation errors, rejects with an error message if the failed response does
     *     not contain validation errors.
     */
     changeState : function(op) {
        var self = this;
        var deferred = $.Deferred();
        if (!this.isNew()) {
            $.ajax({
                url: this.urlRoot +  '/' + op,
                method : 'POST',
                headers : {
                    'Accept' : 'application/json'
                },
                contentType : 'application/json',
                processData : false,
                data: '{"id" : ' + this.get('id') + '}',
                success : function(response) {
                    deferred.resolve(response);
                },
                error : function(jqXHR, textStatus, error) {
                    var resp = jqXHR.responseJSON;
                    if (_.has(resp, 'validationErrors') &&
                        _.isArray(resp.validationErrors) &&
                        resp.validationErrors.length > 0) {
                        self.set('validationErrors', resp.validationErrors);
                    deferred.reject(jqXHR, 'Validation errors');
                } else {
                    deferred.reject(jqXHR, 'Unable to ' + op + ' the publication with error: ' + error);
                }
            }
        });
        } else {
            deferred.resolve();
        }
        return deferred.promise();
    },

    /*
     * @return {Jquery.Promise} - resolves with the received response if the release succeeds, rejects with the validationErrors
     *     array if the response contains validation errors, rejects with an error message if the failed response does
     *     not contain validation errors.
     */
     release : function(options) {
        return this.changeState('release', options);
    },

    /*
     * @return {Jquery.Promise} - resolves with the received response if publish succeeds, rejects with the validationErrors
     *     array if the response contains validation errors, rejects with an error message if the failed response does
     *     not contain validation errors.
     */
     publish : function(options) {
        return this.changeState('publish', options);
    },

    save : function() {
        /* Don't send validationErrors to the server */
        this.unset('validationErrors');
        return Backbone.Model.prototype.save.apply(this, arguments);
    }
});
