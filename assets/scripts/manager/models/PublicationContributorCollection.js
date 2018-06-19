define([
    './PublicationContributorModel',
    './OrderedCollection'
], function(PublicationContributorModel, OrderedCollection) {
        var collection = OrderedCollection.extend({
        model : PublicationContributorModel
    });

    return collection;
});
