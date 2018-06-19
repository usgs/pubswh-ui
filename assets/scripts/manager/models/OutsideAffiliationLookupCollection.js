define([
    'backbone',
    './LookupModel'
], function(Backbone, LookupModel) {
        var collection = Backbone.Collection.extend({
        model: LookupModel,
        url: window.CONFIG.lookupUrl + 'outsideaffiliates?mimetype=json'
    });

    return collection;

});
