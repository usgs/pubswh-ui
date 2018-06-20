import 'select2';

import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import CostCenterCollection from '../../../../scripts/manager/models/CostCenterCollection';
import EditPersonView from '../../../../scripts/manager/views/EditPersonView';
import OutsideAffiliationLookupCollection from '../../../../scripts/manager/models/OutsideAffiliationLookupCollection';


describe('views/EditPersonView', function() {
    var testView;
    var $testDiv;
    var testModel;

    var costCenterFetchActiveDeferred, costCenterFetchNotActiveDeferred;
    var outsideAffFetchActiveDeferred, outsideAffFetchNotActiveDeferred;

    beforeEach(function() {
        $('body').append('<div id="test-div"></div>');
        $testDiv = $('#test-div');
        testModel = new Backbone.Model();

        costCenterFetchActiveDeferred = $.Deferred();
        costCenterFetchNotActiveDeferred = $.Deferred();

        outsideAffFetchActiveDeferred = $.Deferred();
        outsideAffFetchNotActiveDeferred  = $.Deferred();

        spyOn(CostCenterCollection.prototype, 'fetch').and.callFake(function(options) {
            if (options.data.active === 'y') {
                return costCenterFetchActiveDeferred;
            } else {
                return costCenterFetchNotActiveDeferred;
            }
        });
        spyOn(OutsideAffiliationLookupCollection.prototype, 'fetch').and.callFake(function(options) {
            if (options.data.active === 'y') {
                return outsideAffFetchActiveDeferred;
            } else {
                return outsideAffFetchNotActiveDeferred;
            }
        });
        testView = new EditPersonView({
            el : $testDiv,
            model : testModel
        });
    });

    afterEach(function() {
        testView.remove();
        $testDiv.remove();
    });

    it('Expects the active and not active cost centers to be fetched', function() {
        expect(CostCenterCollection.prototype.fetch.calls.count()).toBe(2);
        expect(_.find(CostCenterCollection.prototype.fetch.calls.allArgs(), function(arg) {
            return arg[0].data.active === 'y';
        })).toBeDefined();
        expect(_.find(CostCenterCollection.prototype.fetch.calls.allArgs(), function(arg) {
            return arg[0].data.active === 'n';
        })).toBeDefined();
    });

    it('Expects the active and not active outside affiliations to be fetched', function() {
        expect(OutsideAffiliationLookupCollection.prototype.fetch.calls.count()).toBe(2);
        expect(_.find(OutsideAffiliationLookupCollection.prototype.fetch.calls.allArgs(), function(arg) {
            return arg[0].data.active === 'y';
        })).toBeDefined();
        expect(_.find(OutsideAffiliationLookupCollection.prototype.fetch.calls.allArgs(), function(arg) {
            return arg[0].data.active === 'n';
        })).toBeDefined();
    });

    describe('Tests for render', function() {

        beforeEach(function() {
            spyOn($.fn, 'select2').and.callThrough();
            testView.activeCostCenters.set([{id : 1, text : 'CC1'}, {id : 2, text : 'CC2'}]);
            testView.activeOutsideAffiliates.set([{id : 3, text : 'OA3'}, {id : 4, text : 'OA4'}]);

        });

        it('Expects that the DOM text and checkbox elements reflect the contents of the model', function() {
            testModel.set({
                given : 'Mary',
                family : 'Jones',
                suffix : 'MD',
                email : 'mjones@usgs.gov',
                orcid : 'http://orcid.org/0000-0000-0000-0002',
                usgs : true,
                preferred: true
            });
            testView.render();

            expect($testDiv.find('#first-name').val()).toEqual('Mary');
            expect($testDiv.find('#last-name').val()).toEqual('Jones');
            expect($testDiv.find('#suffix').val()).toEqual('MD');
            expect($testDiv.find('#email').val()).toEqual('mjones@usgs.gov');
            expect($testDiv.find('#orcid-id').val()).toEqual('http://orcid.org/0000-0000-0000-0002');
            expect($testDiv.find('#is-usgs').is(':checked')).toEqual(true);
            expect($testDiv.find('#preferred').is(':checked')).toEqual(true);
        });

        it('Expects the all affiliation select to be initialized when all affiliations have been fetched', function() {
            testView.render();
            outsideAffFetchActiveDeferred.resolve();
            expect($.fn.select2).not.toHaveBeenCalled();
            outsideAffFetchNotActiveDeferred.resolve();
            expect($.fn.select2).not.toHaveBeenCalled();
            costCenterFetchActiveDeferred.resolve();
            expect($.fn.select2).not.toHaveBeenCalled();
            costCenterFetchNotActiveDeferred.resolve();
            expect($.fn.select2).toHaveBeenCalled();
            expect($.fn.select2.calls.first().object.hasClass('all-affiliation-select')).toBe(true);
        });

        it('Expects that if affiliations are set in the model then the affiliation field is defined', function() {
            testModel.set({
                usgs : true,
                affiliations : [{id : 2, text : 'CC2'}, {id : 4, text : 'OA4'}]
            });
            testView.render();
            costCenterFetchActiveDeferred.resolve();
            costCenterFetchNotActiveDeferred.resolve();
            outsideAffFetchActiveDeferred.resolve();
            outsideAffFetchNotActiveDeferred.resolve();

            expect($testDiv.find('.all-affiliation-select').val()).toEqual(['2', '4']);
        });
    });

    describe('Tests for model event handlers', function() {
        beforeEach(function() {
            costCenterFetchActiveDeferred.resolve();
            costCenterFetchNotActiveDeferred.resolve();
            outsideAffFetchActiveDeferred.resolve();
            outsideAffFetchNotActiveDeferred.resolve();
            testView.activeCostCenters.set([{id : 1, text : 'CC1'}, {id : 2, text : 'CC2'}]);
            testView.activeOutsideAffiliates.set([{id : 3, text : 'OA3'}, {id : 4, text : 'OA4'}]);
            testView.render();
        });

        it('Expects that the text and checkbox inputs are updated when there properties are updated', function() {
            testModel.set({
                given : 'Mary',
                family : 'Jones',
                suffix : 'MD',
                email : 'mjones@usgs.gov',
                orcid : 'http://orcid.org/0000-0000-0000-0002',
                usgs : true,
                preferred : true
            });

            expect($testDiv.find('#first-name').val()).toEqual('Mary');
            expect($testDiv.find('#last-name').val()).toEqual('Jones');
            expect($testDiv.find('#suffix').val()).toEqual('MD');
            expect($testDiv.find('#email').val()).toEqual('mjones@usgs.gov');
            expect($testDiv.find('#orcid-id').val()).toEqual('http://orcid.org/0000-0000-0000-0002');
            expect($testDiv.find('#is-usgs').is(':checked')).toEqual(true);
            expect($testDiv.find('#preferred').is(':checked')).toEqual(true);
        });
    });

    describe('Tests for DOM event handlers', function() {
        var ev;
        beforeEach(function() {
            costCenterFetchActiveDeferred.resolve();
            costCenterFetchNotActiveDeferred.resolve();
            outsideAffFetchActiveDeferred.resolve();
            outsideAffFetchNotActiveDeferred.resolve();
            testView.activeCostCenters.set([{id : 1, text : 'CC1'}, {id : 2, text : 'CC2'}]);
            testView.activeOutsideAffiliates.set([{id : 3, text : 'OA3'}, {id : 4, text : 'OA4'}]);
            testModel.set('affiliations', [{id : 1, text : 'CC1'}]);
            testView.render();
        });

        it('Expects that updating text and checkbox inputs is reflected in the model', function() {
            $testDiv.find('#first-name').val('Mary').trigger('change');
            expect(testModel.get('given')).toEqual('Mary');

            $testDiv.find('#last-name').val('Jones').trigger('change');
            expect(testModel.get('family')).toEqual('Jones');

            $testDiv.find('#suffix').val('PhD').trigger('change');
            expect(testModel.get('suffix')).toEqual('PhD');

            $testDiv.find('#email').val('mjones@google.com').trigger('change');
            expect(testModel.get('email')).toEqual('mjones@google.com');

            $testDiv.find('#is-usgs').trigger('click');
            expect(testModel.get('usgs')).toBe(true);

            $testDiv.find('#is-usgs').trigger('click');
            expect(testModel.get('usgs')).toBe(false);

            $testDiv.find('#preferred').trigger('click');
            expect(testModel.get('preferred')).toBe(true);

            $testDiv.find('#preferred').trigger('click');
            expect(testModel.get('preferred')).toBe(false);
        });

        it('Expects that when an affiliation is selected, it is added to the current affiliations', function() {
            var affiliations;
            ev = {
                params : {
                    data : {id : 2, text : 'CC2'}
                }
            };
            testView.selectAffiliations(ev);
            affiliations = testModel.get('affiliations');
            expect(affiliations.length).toBe(2);
            expect(affiliations).toContain({id : 2, text : 'CC2'});
        });

        it('Expects that an affiliation is removed, it is removed from current affiliations', function() {
            var affiliations;
            ev = {
                params : {
                    data : {id : 1, text : 'CC1'}
                }
            };
            testView.unselectAffiliations(ev);
            affiliations = testModel.get('affiliations');
            expect(affiliations.length).toBe(0);
        });
    });
});
