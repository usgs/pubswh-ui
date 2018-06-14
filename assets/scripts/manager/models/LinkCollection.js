define([
    'models/LinkModel',
    'models/OrderedCollection'
], function(LinkModel, OrderedCollection) {
        var collection = OrderedCollection.extend({
        model : LinkModel
    });

    return collection;
});
