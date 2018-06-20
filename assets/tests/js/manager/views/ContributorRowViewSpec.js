import $ from 'jquery';

import ContributorRowView from '../../../../scripts/manager/views/ContributorRowView';
import PublicationContributorModel from '../../../../scripts/manager/models/PublicationContributorModel';
import PublicationContributorCollection from '../../../../scripts/manager/models/PublicationContributorCollection';


describe('ContributorRowView', function() {
    var testView, testModel, testCollection;

    beforeEach(function() {
        $('body').append('<div id="test-div"></div>');

        testModel = new PublicationContributorModel();
        testCollection = new PublicationContributorCollection();
    });

    afterEach(function() {
        testView.remove();
        $('#test-div').remove();
    });

    describe('Tests for render', function() {
        beforeEach(function() {
            testView = new ContributorRowView({
                el : '#test-div',
                model : testModel,
                collection : testCollection
            });
            testModel.set({
                affiliations: [{id: 1, text: 'Affiliation 1'}, {id: 2, text: 'Affiliation 2'}],
                rank : 1,
                contributorId: 10,
                text: 'Contributor 10',
                corporation: false
            });
            testCollection.add(testModel);

            spyOn($.fn, 'select2');
        });

        it('Expects that the select2\'s are initialized', function() {
            testView.render();
            expect($.fn.select2.calls.count()).toBe(2);

            expect(testView.$('.contributor-type-input').val()).toEqual('people');
            expect(testView.$('.contributor-name-input').val()).toEqual('10');
        });

        it('Expects that the contributor name selects2 url function result changes depending on the corporation property', function() {
            var getUrl;

            testView.render();
            getUrl = $.fn.select2.calls.argsFor(1)[0].ajax.url;
            expect(getUrl()).toEqual('test_lookup/people');

            testModel.set('corporation', true);
            expect(getUrl()).toEqual('test_lookup/corporations');
        });

        it('Expects affliation to be set to the value in the model', function() {
            testView.render();
            expect(testView.$('.affiliation-input').val()).toEqual('Affiliation 1, Affiliation 2');
        });
    });

    describe('Tests for DOM event handlers', function() {
        beforeEach(function() {
            testView = new ContributorRowView({
                el : '#test-div',
                model : testModel,
                collection : testCollection
            });
            testModel.set({
                affiliations: [{id: 1, text: 'Affiliation 1'}, {id: 2, text: 'Affiliation 2'}],
                rank : 1,
                contributorId: 10,
                text: 'Contributor 10',
                corporation: false
            });
            testCollection.add(testModel);

        });

        it('Expects selecting a type to update corporations in model', function() {
            var ev = {
                currentTarget : {
                    value : 'corporations'
                }
            };
            testView.selectType(ev);
            expect(testModel.get('corporation')).toBe(true);

            ev.currentTarget.value = 'people';
            testView.selectType(ev);
            expect(testModel.get('corporation')).toBe(false);
        });

        it('Expects selecting a contributor name fetches the contributor after setting the contributor Id', function() {
            var ev = {
                currentTarget : {
                    value : 11
                }
            };
            spyOn(testModel, 'fetch');
            testView.selectName(ev);
            expect(testModel.get('contributorId')).toEqual(11);
            expect(testModel.fetch).toHaveBeenCalled();
        });

        it('Expects when the order is changed that the collection is updated', function() {
            spyOn(testCollection, 'updateModelRank');
            testView.updateOrder({}, 2);
            expect(testCollection.updateModelRank.calls.argsFor(0)).toEqual([testModel, 3]);
        });

        it('Expects the model to be removed from the collection if the row is deleted', function() {
            spyOn(testCollection, 'remove');
            testView.deleteRow();
            expect(testCollection.remove.calls.argsFor(0)).toEqual([testModel]);
        });

        // Temporarily disable this test as we will be linking to the old MyPubs app until the edit
        // contributors page has been implemented in the new app.
        xit('Expects that if the edit link is clicked a new window is opened to edit the contributor', function() {
            spyOn(window, 'open');
            testView.clickEditLink();
            expect(window.open.calls.argsFor(0)[0]).toContain('#contributor/10');
        });
    });

    describe('Tests for model event handlers', function() {
        beforeEach(function() {
            testView = new ContributorRowView({
                el : '#test-div',
                model : testModel,
                collection : testCollection
            });
            testModel.set({
                affiliations: [{id: 1, text: 'Affiliation 1'}, {id: 2, text: 'Affiliation 2'}],
                rank : 1,
                contributorId: 10,
                text: 'Contributor 10',
                corporation: false
            });
            testCollection.add(testModel);

            testView.render();
        });

        it('Expects the type select to be updated if the corporation property is changed', function() {
            testModel.set('corporation', true);
            expect(testView.$('.contributor-type-input').val()).toEqual('corporations');
        });

        it('Expects the contributor name to be updated if the text property is changed', function() {
            testModel.set({
                contributorId: 11,
                text : 'New Contributor'
            });
            expect(testView.$('.contributor-name-input').val()).toEqual('11');
        });

    });
});
