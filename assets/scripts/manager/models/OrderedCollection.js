define([
    'backbone'
], function(Backbone) {
        var collection = Backbone.Collection.extend({

        comparator : 'rank',

        /*
         * @param {LinkModel} modelToUpdate - Assumes modelToUpdate is in the collection
         * @param {Number} newRank
         * @returns {LinkCollection} - Models are updated and the collection is sorted by rank
         *
         * Updates the rank attribute of the models in the collection so that modelToUpdate has newRank,
         * pushing others up or down as appropriate. The colleciton is then sorted
         */
        updateModelRank : function(modelToUpdate, newRank) {
            var oldRank = modelToUpdate.get('rank');
            if (oldRank < newRank) {
                this.chain()
                        .filter(function(model) {
                            return model.attributes.rank > oldRank && model.attributes.rank <= newRank;
                        })
                        .each(function(model) {
                            var thisRank = model.get('rank');
                            model.set('rank', thisRank - 1);
                        });

            } else if (oldRank > newRank) {
                this.chain()
                        .filter(function(model) {
                            return model.attributes.rank >= newRank && model.attributes.rank < oldRank;
                        })
                        .each(function(model) {
                            var thisRank = model.get('rank');
                            model.set('rank', thisRank + 1);
                        });
            }

            modelToUpdate.set('rank', newRank);
            this.sort();

            return this;
        },

        /*
         * In addition to removing the model from the collection, the rank of the remaining models are
         * updated as appropriate and the collection is sorted.
         */
        remove : function(model) {
            var modelRank = model.get('rank');

            Backbone.Collection.prototype.remove.apply(this, arguments);
            this.chain()
                    .filter(function(model) {
                        return model.attributes.rank > modelRank;
                    })
                    .each(function(model) {
                        model.set('rank', model.get('rank') - 1);
                    });
            this.sort();
        }
    });

    return collection;
});
