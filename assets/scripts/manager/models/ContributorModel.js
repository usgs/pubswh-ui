define([
    'backbone'
], function(Backbone) {
        var model = Backbone.Model.extend({
        idAttribute : 'contributorId',

        url : window.CONFIG.scriptRoot + '/manager/services/',

        sync : function(method, model, options) {
            var urlEndpoint;
            switch(method) {
                case 'create':
                case 'update':
                    if (model.has('corporation') && model.get('corporation')) {
                        urlEndpoint = 'corporation';
                    } else if (model.has('usgs') && model.get('usgs')) {
                        urlEndpoint = 'usgscontributor';
                    } else {
                        urlEndpoint = 'outsidecontributor';
                    }

                    if (method === 'update') {
                        urlEndpoint += '/' + model.get('contributorId');
                    }
                    break;

                case 'read' :
                    urlEndpoint = 'contributor/' + model.get('contributorId');
                    break;
            }
            options.url = model.url + urlEndpoint;
            return Backbone.sync(method, model, options);
        },

        save : function() {
            /* Don't send validationErrors to the server */
            this.unset('validationErrors');
            return Backbone.Model.prototype.save.apply(this, arguments);
        }


    });

    return model;
});
