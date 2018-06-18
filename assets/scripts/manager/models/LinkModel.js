define([
    'backbone'
], function(Backbone) {
        var model = Backbone.Model.extend({
        defaults : function() {
            return {rank : ''};
        }
    });

    return model;
});
