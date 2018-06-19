define([
    'backbone',
    './LookupModel'
], function(Backbone, LookupModel) {
        var collection = Backbone.Collection.extend({
        model : LookupModel,
        url : window.CONFIG.lookupUrl + 'publishingServiceCenters?mimetype=json'
    });

    return collection;
});
