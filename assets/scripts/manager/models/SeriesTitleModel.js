define([
    'backbone',
    'module'
], function(Backbone, module) {
    var model = Backbone.Model.extend({

        urlRoot : module.config().scriptRoot + '/manager/services/publicationSeries',

        defaults : {
            'active' : true
        }

    });

    return model;
});
