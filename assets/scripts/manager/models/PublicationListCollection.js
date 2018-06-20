import Backbone from 'backbone';


export default Backbone.Collection.extend({
    url : window.CONFIG.scriptRoot + '/manager/services/lists',

    comparator : 'text'
});
