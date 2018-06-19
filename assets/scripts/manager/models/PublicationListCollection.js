define([
    'backbone'
], function(Backbone) {
        var collection = Backbone.Collection.extend({
        url : window.CONFIG.scriptRoot + '/manager/services/lists',

        comparator : 'text'
    });

    return collection;
});
