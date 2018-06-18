define([
    'squire',
    'jquery',
    'backbone',
    'underscore',
    'models/AffiliationModel',
    'models/LookupModel',
    'models/CostCenterCollection',
    'models/OutsideAffiliationLookupCollection',
    'views/BaseView'
], function(Squire, $, Backbone, _, AffiliationModel, LookupModel, CostCenterCollection,
            OutsideAffiliatesCollection, BaseView) {
    describe('views/ManageAffiliationView', function() {
        var ManageAffiliationView, testView;
        var $testDiv;
        var testModel;
        var fetchModelDeferred;
        var saveModelDeferred;
        var deleteModelDeferred;
        var testRouter;

        var setElementAlertViewSpy, showSuccessAlertSpy, showDangerAlertSpy, closeAlertSpy, removeAlertViewSpy;

        var costCenterFetchSpy, costCenterFetchActiveDeferred, costCenterFetchInactiveDeferred;
        var outsideAffiliationFetchSpy, outsideAffiliationActiveDeferred, outsideAffiliationInactiveDeferred;

        var injector;

        beforeEach(function(done) {
            $('body').append('<div id="test-div"></div>');
            $testDiv = $('#test-div');

            spyOn(BaseView.prototype, 'initialize').and.callThrough();
            spyOn(BaseView.prototype, 'render').and.callThrough();

            costCenterFetchActiveDeferred = $.Deferred();
            costCenterFetchInactiveDeferred = $.Deferred();
            costCenterFetchSpy = jasmine.createSpy('costCenterFetchSpy').and.callFake(function(options) {
                if (options.data.active === 'y') {
                    return costCenterFetchActiveDeferred;
                } else {
                    return costCenterFetchInactiveDeferred;
                }
            });

            outsideAffiliationActiveDeferred = $.Deferred();
            outsideAffiliationInactiveDeferred = $.Deferred();
            outsideAffiliationFetchSpy = jasmine.createSpy('outsideAffiliationFetchSpy').and.callFake(function(options) {
                if (options.data.active === 'y') {
                    return outsideAffiliationActiveDeferred;
                } else {
                    return outsideAffiliationInactiveDeferred;
                }
            });

            testModel = new AffiliationModel();
            fetchModelDeferred = $.Deferred();
            saveModelDeferred = $.Deferred();
            deleteModelDeferred = $.Deferred();
            spyOn(testModel, 'fetch').and.returnValue(fetchModelDeferred.promise());
            spyOn(testModel, 'save').and.returnValue(saveModelDeferred.promise());
            spyOn(testModel, 'destroy').and.returnValue(deleteModelDeferred.promise());

            setElementAlertViewSpy = jasmine.createSpy('setElementAlertViewSpy');
            showSuccessAlertSpy = jasmine.createSpy('showSuccessAlertSpy');
            showDangerAlertSpy = jasmine.createSpy('showDangerAlertSpy');
            closeAlertSpy = jasmine.createSpy('closeAlertSpy');
            removeAlertViewSpy = jasmine.createSpy('removeAlertViewSpy');

            testRouter = jasmine.createSpyObj('testRouterSpy', ['navigate']);

            injector = new Squire();
            injector.mock('jquery', $);
            injector.mock('views/AlertView', Backbone.View.extend({
                setElement : setElementAlertViewSpy,
                showSuccessAlert : showSuccessAlertSpy,
                showDangerAlert : showDangerAlertSpy,
                closeAlert : closeAlertSpy,
                remove : removeAlertViewSpy
            }));
            injector.mock('models/CostCenterCollection', Backbone.Collection.extend({
                model : LookupModel,
                url : '/test/lookup',
                fetch : costCenterFetchSpy
            }));
            injector.mock('models/OutsideAffiliationLookupCollection', Backbone.Collection.extend({
                model : LookupModel,
                url : '/test/lookup',
                fetch : outsideAffiliationFetchSpy
            }));

            injector.require(['views/ManageAffiliationView'], function(View) {
                ManageAffiliationView = View;
                testView = new ManageAffiliationView({
                    el : $testDiv,
                    model : testModel,
                    router : testRouter
                });
                done();
            });
        });

        afterEach(function() {
            injector.remove();
            if (testView) {
                testView.remove();
            }
            $testDiv.remove();
        });

        it('Expects that the alertView has been created', function() {
            expect(setElementAlertViewSpy).toHaveBeenCalled();
        });

        it('Expects active and inactive cost centers to fetched', function() {
            expect(costCenterFetchSpy.calls.count()).toBe(2);
            var activeCostCenters = _.find(costCenterFetchSpy.calls.allArgs(), function(arg) {
                return arg[0].data.active === 'y';
            });
            expect(activeCostCenters).toBeDefined();
            var inactiveCostCenters = _.find(costCenterFetchSpy.calls.allArgs(), function(arg) {
                return arg[0].data.active === 'n';
            });
            expect(inactiveCostCenters).toBeDefined();
        });

        it('Expects active and inactive outside affiliates to be fetched', function() {
            expect(outsideAffiliationFetchSpy.calls.count()).toBe(2);
            var activeAffiliates = _.find(outsideAffiliationFetchSpy.calls.allArgs(), function(arg) {
                return arg[0].data.active === 'y';
            });
            expect(activeAffiliates).toBeDefined();
            var inactiveAffiliates = _.find(outsideAffiliationFetchSpy.calls.allArgs(), function(arg) {
                return arg[0].data.active === 'n';
            });
            expect(inactiveAffiliates).toBeDefined();
        });

        describe('Tests for render', function() {

            beforeEach(function() {
                spyOn($.fn, 'select2').and.callThrough();
                testView.activeCostCenters.set([{id : 23, text : 'Cost Center 1'}, {id : 24, text : 'Cost Center 2'}]);
                testView.activeOutsideAffiliates.set([{id : 41, text : 'Super Secret Police'}, {id : 42, text : 'Fellowship of Strangers'}]);
            });

            it('Expects a drop with affiliation types is populated', function() {
                testView.render();
                var select2Calls = $.fn.select2.calls.count();
                expect(select2Calls).toBe(1);
            });

            it('Expects a select2 dropdown called with expected data', function() {
                var affiliationTypeSelect;
                testView.render();
                affiliationTypeSelect = $('.edit-affiliation-type-input');
                expect(affiliationTypeSelect.select2).toHaveBeenCalledWith({}, {theme : 'bootstrap', allowClear: true});
                var selectOptions = $('#edit-affiliation-type-input option');
                expect(selectOptions.length).toEqual(3);
                expect(selectOptions[1].outerHTML).toEqual('<option value="1">Cost Center</option>');
                expect(selectOptions[2].outerHTML).toEqual('<option value="2">Outside Affiliation</option>');
            });

            it('Expects that the affiliationIsCostCenter is set to null initially', function() {
                testView.render();
                expect(testView.affiliationIsCostCenter).toBe(null);
            });

            describe('Test for DOM event handlers', function() {

                beforeEach(function() {
                    testView.render();
                });

                it('Expects that if an affiliation type is selected, the affiliation edit select will be enabled', function() {
                    $testDiv.find('#edit-affiliation-type-input').val('1').trigger('select2:select');
                    expect($testDiv.find('#edit-affiliation-input').is(':disabled')).toBe(false);
                });

                it('Expects that affiliationIsCostCenter is true if a user selects the cost center type', function() {
                    $testDiv.find('#edit-affiliation-type-input').val('1').trigger('select2:select');
                    expect(testView.affiliationIsCostCenter).toBe(true);
                });

                it('Expects that affiliationIsCostCenter is false if a user selects the outside affiliation type', function() {
                    $testDiv.find('#edit-affiliation-type-input').val('2').trigger('select2:select');
                    expect(testView.affiliationIsCostCenter).toBe(false);
                });

                it('Expects the affiliation selector and create button are shown if a cost center is selected', function() {
                    $testDiv.find('#edit-affiliation-type-input').val('1').trigger('select2:select');
                    var $containerCreateEdit = $testDiv.find('.select-create-or-edit-container');
                    expect($containerCreateEdit.is(':visible')).toBe(true);
                });

                it('Expects the affiliation selector and create buttn are shown if an outside affiliate is selected', function() {
                    $testDiv.find('#edit-affiliation-type-input').val('2').trigger('select2:select');
                    var $containerCreateEdit = $testDiv.find('.select-create-or-edit-container');
                    expect($containerCreateEdit.is(':visible')).toBe(true);
                });

                it('Expects the cost center values are read if the cost center type is selected', function() {
                    $testDiv.find('#edit-affiliation-type-input').val('1').trigger('select2:select');
                    expect(costCenterFetchSpy).toHaveBeenCalled();
                });
            });

            describe('Tests for creating a new affiliation', function() {
                var $saveBtn;
                var $deleteBtn;

                beforeEach(function() {
                    testView.render();
                    $testDiv.find('.create-btn').trigger('click');
                    $saveBtn = $testDiv.find('.save-btn');
                    $deleteBtn = $testDiv.find('.delete-btn');
                });

                it('Expects that the delete button is disabled', function() {
                    expect($deleteBtn.is(':disabled')).toEqual(true);
                });

                it('Expects that fields are initially blank', function() {
                    expect($testDiv.find('#affiliation-input').val()).toEqual('');
                    expect($testDiv.find('#affiliation-active-input').is(':checked')).toBe(false);
                });

                it('Expects that a successful save updates the route', function() {
                    $saveBtn.trigger('click');
                    testModel.set('id', 78391);
                    saveModelDeferred.resolve();

                    expect(showSuccessAlertSpy).toHaveBeenCalled();
                    expect(testRouter.navigate).toHaveBeenCalledWith('affiliation/78391');
                });
            });

            describe('Tests for editing an affiliation', function() {

                var $saveBtn;
                var $cancelBtn;
                var $newAffiliationBtn;
                var $deleteBtn;
                var $deleteOkBtn;

                beforeEach(function() {
                    testModel.set({
                        text : 'Super Secret Police',
                        id : 41,
                        active : true
                    });
                    testView.render();
                    $testDiv.find('edit-affiliation-input').val('41').trigger('select2:select');
                    $saveBtn = $testDiv.find('.save-btn');
                    $cancelBtn = $testDiv.find('.cancel-btn');
                    $newAffiliationBtn = $testDiv.find('.create-new-btn');
                    $deleteBtn = $testDiv.find('.delete-btn');
                    $deleteOkBtn = $testDiv.find('.delete-ok-btn');
                });

                it('Expects that the delete button is enabled', function() {
                    expect($deleteBtn.is(':disabled')).toBe(false);
                });

                it('Expects that the affiliation and active checkboxes reflect the model', function() {
                    expect($testDiv.find('#affiliation-input').val()).toEqual('Super Secret Police');
                    expect($testDiv.find('#affiliation-active-input').is(':checked')).toEqual(true);
                });

                it('Expects the model to be updated if a value changes', function() {
                    $testDiv.find('#affiliation-input').val('Super Secret Police 10th Div').trigger('change');
                    $testDiv.find('#affiliation-active-input').attr('checked', false).trigger('change');
                    expect(testModel.get('text')).toEqual('Super Secret Police 10th Div');
                    expect(testModel.get('active')).toBe(false);
                });

                it('Expects that saving does calls the model save method', function() {
                    $saveBtn.trigger('click');
                    expect(testModel.save).toHaveBeenCalled();
                });

                it('Expects that clicking the cancel button re-fetches the model', function() {
                    $cancelBtn.trigger('click');
                    expect(testModel.fetch).toHaveBeenCalled();
                });

                it('Expects that clicking the delete OK button calls the model destroy method', function() {
                    $deleteOkBtn.trigger('click');
                    expect(testModel.destroy).toHaveBeenCalled();
                });

                it('Expects that the clicking on the edit new affiliation button navigates back to the root affiliation page', function() {
                    $newAffiliationBtn.trigger('click');
                    expect(testRouter.navigate).toHaveBeenCalled();
                    expect(testRouter.navigate.calls.argsFor(0)[0]).toEqual('affiliation');
                });
            });
        });
    });
});
