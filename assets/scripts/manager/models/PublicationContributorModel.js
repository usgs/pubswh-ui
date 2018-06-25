import Backbone from 'backbone';
import extend from 'lodash/extend';
import has from 'lodash/has';
import isObject from 'lodash/isObject';


export default Backbone.Model.extend({

    comparator : 'rank',

    url : function() {
        return window.CONFIG.scriptRoot + '/manager/services/contributor/' + this.get('contributorId');
    },

    defaults : function() {
        return {
            rank : ''
        };
    },

    fetch : function(options) {
        var params = {
            data : {
                mimetype : 'json'
            }
        };
        if (isObject(options)) {
            extend(params, options);
        }
        return Backbone.Model.prototype.fetch.call(this, params);
    },

    parse : function(response) {
        var affiliation = new Object();
        if (!has(response, 'affiliation')) {
            response.affiliation = affiliation;
        }
        return response;
    }
});
