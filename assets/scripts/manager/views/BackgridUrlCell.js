define([
    'backgrid'
    ], function(Backgrid) {
        /*
     * This implements a cell which contains a link. The title attribute can be set via the title property.
     * The link text uses the formatter's fromRaw result. When the link is clicked, the view uses the provided
     * router property to navigate to the result of the toFragment property.
     */
    var view = Backgrid.Cell.extend({
        // The following three properties should be overridden.
        title : '', // Used as the hover in the cell

        /*
         * Should be overridden with an instance of the application's router.
         */
        router : function() {
            return {};
        },

        /*
         * In most instances, this will need to be overridden.
         * @param {Object} - This will be the model's value for the column that this cell was created in.
         * @param {Backbone.Model} - The model for this cell. Will be a model within the collection that the grid represents
         * @returns String - The fragment that will be passed to the router's navigate function when
         * the cell is clicked.
         */
        toFragment : function(rawValue) {
            return rawValue;
        },

        className : 'backgrid-url-cell',

        events : {
            'click a' : 'navigate'
        },

        initialize : function(options) {
            this.title = options.title || this.title;
            Backgrid.Cell.prototype.initialize.apply(this, arguments);
        },

        render : function() {
            var rawValue = this.model.get(this.column.get('name'));
            var formattedValue = this.formatter.fromRaw(rawValue, this.model);
            this.$el.empty();
            this.$el.append($('<a>', {
                tabIndex : -1,
                href : '#',
                title : this.title
            }).text(formattedValue));
            this.delegateEvents();

            return this;
        },

        navigate : function(ev) {
            ev.preventDefault();
            var rawValue = this.model.get(this.column.get('name'));
            this.router.navigate(this.toFragment(rawValue, this.model), {trigger : true});
        }

    });

    return view;
});
