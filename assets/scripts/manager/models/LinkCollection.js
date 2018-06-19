define([
    './LinkModel',
    './OrderedCollection'
], function(LinkModel, OrderedCollection) {
        var collection = OrderedCollection.extend({
        model : LinkModel
    });

    return collection;
});
