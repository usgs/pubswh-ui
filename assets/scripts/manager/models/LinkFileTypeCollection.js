import Backbone from 'backbone';

import LookupModel from './LookupModel';


export default Backbone.Collection.extend({
    model : LookupModel,
    url : window.CONFIG.lookupUrl + 'linkfiletypes?mimetype=json'
});
