/*jslint browser: true */

define([
    'handlebars',
    'views/BaseView',
    'text!hb_templates/search.hbs'
], function(Handlebars, BaseView, hbTemplate) {
    "use strict";

    var view = BaseView.extend({
        template : Handlebars.compile(hbTemplate)
    });

    return view;
});