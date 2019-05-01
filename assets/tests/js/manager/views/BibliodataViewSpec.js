import $ from 'jquery';

import BibliodataView from '../../../../scripts/manager/views/BibliodataView';
import CostCenterCollection from '../../../../scripts/manager/models/CostCenterCollection';
import PublicationModel from '../../../../scripts/manager/models/PublicationModel';
import PublicationTypeCollection from '../../../../scripts/manager/models/PublicationTypeCollection';


describe('BibliodataView', function() {
    let pubTypeFetchDeferred, costCenterFetchActiveDeferred, costCenterFetchNotActiveDeferred;
    let pubModel;
    let testView;

    beforeEach(function() {
        $('body').append('<div id="test-div"></div>');

        pubModel = new PublicationModel();

        pubTypeFetchDeferred = $.Deferred();
        costCenterFetchActiveDeferred = $.Deferred();
        costCenterFetchNotActiveDeferred = $.Deferred();

        spyOn(window, 'setInterval');  // So the tinymce does not get initialized

        spyOn(PublicationTypeCollection.prototype, 'fetch').and.returnValue(pubTypeFetchDeferred);
        spyOn(CostCenterCollection.prototype, 'fetch').and.callFake(function(options) {
            if (options.data.active === 'y') {
                return costCenterFetchActiveDeferred;
            } else {
                return costCenterFetchNotActiveDeferred;
            }
        });
    });

    afterEach(function() {
        testView.remove();
        $('#test-div').remove();
    });

    it('Expects that the publicationType lookup values are fetched at initialization', function() {
        testView = new BibliodataView({
            model : pubModel,
            el : '#test-div'
        });

        expect(PublicationTypeCollection.prototype.fetch).toHaveBeenCalled();
    });

    it('Expects that the both the active and not active cost centers are fetched at initialization', function() {
        testView = new BibliodataView({
            model : pubModel,
            el : '#test-div'
        });

        expect(CostCenterCollection.prototype.fetch.calls.count()).toBe(2);
        expect(CostCenterCollection.prototype.fetch.calls.argsFor(0)[0].data.active).toEqual('y');
        expect(CostCenterCollection.prototype.fetch.calls.argsFor(1)[0].data.active).toEqual('n');
    });

    describe('Tests for render', function() {

        beforeEach(function() {
            testView = new BibliodataView({
                model : pubModel,
                el : '#test-div'
            });
            spyOn(testView, 'stickit');
            spyOn($.fn, 'select2').and.callThrough();
        });

        it('Expects that stickit is initialized', function() {
            testView.render();
            expect(testView.stickit).toHaveBeenCalled();
        });

        it('Expects that select2\'s that do not preload their selections are initialized', function() {
            testView.render();
            expect($.fn.select2.calls.count()).toBe(3);
        });

        // TODO: figure out how to test select2's better. In particular I'd like to test setting up the new transport option
        // for the pub-subtype-input
        it('Expects that the publication type and larger work type input\'s are initialized when the publication type fetch is done', function() {
            let select2Count;
            testView.render();
            select2Count = $.fn.select2.calls.count();
            pubTypeFetchDeferred.resolve();
            expect($.fn.select2.calls.count()).toBe(select2Count + 2);
        });

        it('Expects that the costCenter select is initialized after both cost center fetches are complete', function() {
            let select2Count;
            testView.render();
            select2Count = $.fn.select2.calls.count();
            costCenterFetchActiveDeferred.resolve();
            expect($.fn.select2.calls.count()).toBe(select2Count);
            costCenterFetchNotActiveDeferred.resolve();
            expect($.fn.select2.calls.count()).toBe(select2Count + 1);
        });
    });

    describe('Test DOM event handling for the select2\'s', function() {
        let ev;

        beforeEach(function() {
            pubModel.set({
                publicationType : {id : 1, text : 'Type 1'},
                publicationSubtype : {id : 2, text : 'Subtype 2'},
                seriesTitle : {id : 3, text : 'Series Title 3'},
                costCenters : [{id : 4, text : 'CC 4'}, {id : 5, text : 'CC 5'}],
                largerWorkType : {id : 6, text : 'Type 6'},
                largerWorkSubtype : {id : 7, text : 'Subtype 7'}
            });
            testView = new BibliodataView({
                model : pubModel,
                el : '#test-div'
            });
            spyOn(testView, 'stickit');
            spyOn($.fn, 'select2');

            testView.render();
        });

        it('Expects that when a pub type is selected, the publicationType is updated and the publicationSubtype and seriesTitle are unset', function() {
            ev = {
                currentTarget : {
                    value : 11,
                    selectedOptions : [{innerHTML : 'Type11'}]
                }
            };
            testView.selectPubType(ev);
            expect(pubModel.get('publicationType')).toEqual({id : 11, text : 'Type11'});
            expect(pubModel.get('publicationSubType')).toBeUndefined();
            expect(pubModel.get('seriesTitle')).toBeUndefined();
        });

        it('Expects that when a pub type is cleared, the publicationType, publicationSubtype, and seriesTitle are unset', function() {
            testView.resetPubType();
            expect(pubModel.get('publicationType')).toBeUndefined();
            expect(pubModel.get('publicationSubtype')).toBeUndefined();
            expect(pubModel.get('seriesTitle')).toBeUndefined();
        });

        it('Expects that when a pub subtype is selected, the publicationSubtype is updated and the seriesTitle is unset', function() {
            ev = {
                currentTarget : {
                    value : 12,
                    selectedOptions : [{innerHTML : 'Subtype 12'}]
                }
            };
            testView.selectPubSubtype(ev);
            expect(pubModel.get('publicationSubtype')).toEqual({id : 12, text : 'Subtype 12'});
            expect(pubModel.get('seriesTitle')).toBeUndefined();
        });

        it('Expects that when a pub subtype is cleared, the publicationSubtype and seriesTitle are unset', function() {
            testView.resetPubSubtype();
            expect(pubModel.get('publicationSubtype')).toBeUndefined();
            expect(pubModel.get('seriesTitle')).toBeUndefined();
        });

        it('Expects than when a series title is selected, the seriesTitle is updated', function() {
            ev = {
                currentTarget : {
                    value : 13,
                    selectedOptions : [{innerHTML : 'Series Title 13'}]
                }
            };
            testView.selectSeriesTitle(ev);
            expect(pubModel.get('seriesTitle')).toEqual({id : 13, text : 'Series Title 13'});
        });

        it('Expects that when a series title is cleared, the seriesTitle is unset', function() {
            testView.resetSeriesTitle();
            expect(pubModel.get('seriesTitle')).toBeUndefined();
        });

        it('Expects that when a cost center is selected, it is added to the current costCenters', function() {
            let costCenters;
            ev = {
                params : {
                    data : {id : 15, text : 'CC 15'}
                }
            };

            testView.selectCostCenter(ev);
            costCenters = pubModel.get('costCenters');
            expect(costCenters.length).toBe(3);
            expect(costCenters).toContain({id : 4, text : 'CC 4'});
            expect(costCenters).toContain({id : 5, text : 'CC 5'});
            expect(costCenters).toContain({id : 15, text : 'CC 15'});

            pubModel.unset('costCenters');
            testView.selectCostCenter(ev);
            costCenters = pubModel.get('costCenters');
            expect(costCenters.length).toBe(1);
            expect(costCenters).toContain({id : 15, text : 'CC 15'});
        });

        it('Expects that when a cost center is removed, costCenters is updated appropriately', function() {
            let costCenters;
            ev = {
                params : {
                    data : {id : 4, text : 'CC 4'}
                }
            };
            testView.unselectCostCenter(ev);
            costCenters = pubModel.get('costCenters');
            expect(costCenters.length).toBe(1);
            expect(costCenters).toEqual([{id : 5, text : 'CC 5'}]);
        });

        it('Expects that when a larger work type is selected, the largerWorkType is updated and the largerWorkSubtype is unset', function() {
            ev = {
                currentTarget : {
                    value : 20,
                    selectedOptions: [{innerHTML : 'Type 20'}]
                }
            };
            testView.selectLargerWorkType(ev);
            expect(pubModel.get('largerWorkType')).toEqual({id : 20, text : 'Type 20'});
            expect(pubModel.get('largerWorkSubtype')).toBeUndefined();
        });

        it('Expects that when a larger work type is cleared, the largerWorkType  and largerWorkSubtype are unset', function() {
            testView.resetLargerWorkType();
            expect(pubModel.get('largerWorkType')).toBeUndefined();
            expect(pubModel.get('largerWorkSubtype')).toBeUndefined();
        });

        it('Expects that when a larger work subtype is selected, the largerWorkSubtype is updated', function() {
            ev = {
                currentTarget : {
                    value : 20,
                    selectedOptions: [{innerHTML : 'Subtype 20'}]
                }
            };
            testView.selectLargerWorkSubtype(ev);
            expect(pubModel.get('largerWorkSubtype')).toEqual({id : 20, text : 'Subtype 20'});
        });

        it('Expects that when a larger work subtype is cleared, the largerWorkSubtype is unset', function() {
            testView.resetLargerWorkSubtype();
            expect(pubModel.get('largerWorkSubtype')).toBeUndefined();
        });
    });

    describe('Tests for model event listeners', function() {

        beforeEach(function() {
            pubModel.set({
                publicationType : {id : 1, text : 'Type 1'},
                publicationSubtype : {id : 2, text : 'Subtype 2'},
                seriesTitle : {id : 3, text : 'Series Title 3'},
                costCenters : [{id : 4, text : 'CC 4'}, {id : 5, text : 'CC 5'}],
                largerWorkType : {id : 6, text : 'Type 6'},
                largerWorkSubtype : {id : 7, text : 'Subtype 7'}
            });
            testView = new BibliodataView({
                model : pubModel,
                el : '#test-div'
            });

            spyOn(testView, 'stickit');
            spyOn($.fn, 'select2').and.callThrough();

            // For static select2's need to add options.
            testView.publicationTypeCollection.set([{id : 1, text : 'Type1'}, {id : 11, text : 'Type 11'}]);
            testView.activeCostCenters.set([{id : 4, text : 'CC 4'}, {id : 6, text : 'CC 6'}]);
            testView.notActiveCostCenters.set([{id : 5, text : 'CC 5'}]);

            pubTypeFetchDeferred.resolve();
            costCenterFetchActiveDeferred.resolve();
            costCenterFetchNotActiveDeferred.resolve();

            testView.render();
        });

        it('Expects that if publicationType is updated, the pubType DOM element is updated and the subtype DOM element is disabled when publicationType is unset', function() {
            const $type = testView.$('#pub-type-input');
            const $subtype = testView.$('#pub-subtype-input');
            pubModel.set('publicationType', {id : 11, text : 'Type 11'});
            expect($type.val()).toEqual('11');
            expect($subtype.is(':disabled')).toBe(false);

            pubModel.unset('publicationType');
            expect($type.val()).toBeNull();
            expect($subtype.is(':disabled')).toBe(true);
        });

        it('Expects that if publicationSubtype is updated, the pubSubtype DOM element is updated and the seriesTitle DOM element is disabled when there is no publicationSubtype', function() {
            const $subtype = testView.$('#pub-subtype-input');
            const $seriesTitle = testView.$('#series-title-input');
            pubModel.set('publicationSubtype', {id : 12, text : 'Subtype 12'});
            expect($subtype.val()).toEqual('12');
            expect($seriesTitle.is(':disabled')).toBe(false);

            pubModel.unset('publicationSubtype');
            expect($subtype.val()).toBeNull();
            expect($seriesTitle.is(':disabled')).toBe(true);
        });

        it('Expects that if seriesTitle is updated, the seriesTitle DOM element is updated', function() {
            const $seriesTitle = testView.$('#series-title-input');
            pubModel.set('seriesTitle', {id : 13, text : 'Series Title 13'});
            expect($seriesTitle.val()).toEqual('13');

            pubModel.unset('seriesTitle');
            expect($seriesTitle.val()).toBeNull();
        });

        it('Expects that if costCenters is updated, the DOM reflects the change', function() {
            const $costCenters = testView.$('#cost-centers-input');
            pubModel.set('costCenters', [{id : 4, text : 'CC 4'}, {id : 6, text : 'CC 6'}]);
            expect($costCenters.val()).toEqual(['4', '6']);

            pubModel.set('costCenters', [{id : 6, text : 'CC 6'}]);
            expect($costCenters.val()).toEqual(['6']);

            pubModel.set('costCenters', []);
            expect($costCenters.val()).toEqual([]);
        });

        it('Expects that if largerWork is updated, the DOM is updated and the largerSubType DOM is disabled as appropriate', function() {
            const $type = testView.$('#larger-work-type-input');
            const $subtype = testView.$('#larger-work-subtype-input');
            pubModel.set('largerWorkType', {id : 11, text : 'Type 11'});
            expect($type.val()).toEqual('11');
            expect($subtype.is(':disabled')).toBe(false);

            pubModel.unset('largerWorkType');
            expect($type.val()).toBeNull();
            expect($subtype.is(':disabled')).toBe(true);
        });

        it('Expects that if largerWorkSubtype is updated, the DOM is updated', function() {
            const $subtype = testView.$('#larger-work-subtype-input');
            pubModel.set('largerWorkSubtype', {id : 12, text : 'Subtype 12'});
            expect($subtype.val()).toEqual('12');

            pubModel.unset('largerWorkSubtype');
            expect($subtype.val()).toBeNull();
        });

        it('Expects that if docAbstract is updated, the DOM is updated', function() {
            const $abstract = testView.$('#docAbstract-input');
            pubModel.set('docAbstract', 'This is an abstract');
            expect($abstract.val()).toEqual('This is an abstract');

            pubModel.set('docAbstract', '');
            expect($abstract.val()).toEqual('');
        });

        it('Expects that if the tableOfContents is updated, the DOM is updated', function() {
            const $tableOfContents = testView.$('#tableOfContents-input');
            pubModel.set('tableOfContents', 'This is a table of contents');
            expect($tableOfContents.val()).toEqual('This is a table of contents');

            pubModel.set('tableOfContents', '');
            expect($tableOfContents.val()).toEqual('');
        });
    });
});
