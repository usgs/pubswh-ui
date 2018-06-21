import Backbone from 'backbone';


export default Backbone.Model.extend({
    urlRoot : window.CONFIG.scriptRoot + '/manager/services/publicationSeries',
    defaults : {
        'active' : true
    }
});
