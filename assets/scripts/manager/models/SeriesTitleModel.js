define([
    'backbone'
], function(Backbone) {
    var model = Backbone.Model.extend({

        urlRoot : window.CONFIG.scriptRoot + '/manager/services/publicationSeries',

        defaults : {
            'active' : true
        }

    });

    return model;
});
