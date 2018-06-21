import OrderedCollection from '../../../../scripts/manager/models/OrderedCollection';


describe('OrderedCollection', function() {
    var testCollection;
    beforeEach(function () {
        testCollection = new OrderedCollection([
            {id: 1, rank: 1},
            {id: 2, rank: 2},
            {id: 3, rank: 3},
            {id: 4, rank: 4}
        ]);
    });

    describe('Tests for updateModelRank', function () {

        it('Expects that increasing a model\'s rank, decreases the rank of those in between', function () {
            testCollection.updateModelRank(testCollection.get(1), 3);
            expect(testCollection.at(0).attributes).toEqual({id: 2, rank: 1});
            expect(testCollection.at(1).attributes).toEqual({id: 3, rank: 2});
            expect(testCollection.at(2).attributes).toEqual({id: 1, rank: 3});
            expect(testCollection.at(3).attributes).toEqual({id: 4, rank: 4});

            testCollection.updateModelRank(testCollection.get(1), 4);
            expect(testCollection.at(0).attributes).toEqual({id: 2, rank: 1});
            expect(testCollection.at(1).attributes).toEqual({id: 3, rank: 2});
            expect(testCollection.at(2).attributes).toEqual({id: 4, rank: 3});
            expect(testCollection.at(3).attributes).toEqual({id: 1, rank: 4});
        });

        it('Expects that decreasing a model\'s ran, increases the rank of those in between', function () {
            testCollection.updateModelRank(testCollection.get(4), 1);
            expect(testCollection.at(0).attributes).toEqual({id: 4, rank: 1});
            expect(testCollection.at(1).attributes).toEqual({id: 1, rank: 2});
            expect(testCollection.at(2).attributes).toEqual({id: 2, rank: 3});
            expect(testCollection.at(3).attributes).toEqual({id: 3, rank: 4});

            testCollection.updateModelRank(testCollection.get(1), 1);
            expect(testCollection.at(0).attributes).toEqual({id: 1, rank: 1});
            expect(testCollection.at(1).attributes).toEqual({id: 4, rank: 2});
            expect(testCollection.at(2).attributes).toEqual({id: 2, rank: 3});
            expect(testCollection.at(3).attributes).toEqual({id: 3, rank: 4});
        });

        it('Expects that specifying the same rank as the model does nothing', function () {
            testCollection.updateModelRank(testCollection.get(3), 3);
            expect(testCollection.at(0).attributes).toEqual({id: 1, rank: 1});
            expect(testCollection.at(1).attributes).toEqual({id: 2, rank: 2});
            expect(testCollection.at(2).attributes).toEqual({id: 3, rank: 3});
            expect(testCollection.at(3).attributes).toEqual({id: 4, rank: 4});
        });
    });

    describe('Tests for remove', function () {

        it('Expect that the rank of the mode\'s in the collection are updated when a model is remove', function () {
            testCollection.remove(testCollection.get(2));
            expect(testCollection.at(0).attributes).toEqual({id: 1, rank: 1});
            expect(testCollection.at(1).attributes).toEqual({id: 3, rank: 2});
            expect(testCollection.at(2).attributes).toEqual({id: 4, rank: 3});
        });
    });
});
