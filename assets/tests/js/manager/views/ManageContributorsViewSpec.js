import 'select2';

import $ from 'jquery';
import _ from 'underscore';

import AlertView from '../../../../scripts/manager/views/AlertView';
import ContributorModel from '../../../../scripts/manager/models/ContributorModel';
import EditCorporationView from '../../../../scripts/manager/views/EditCorporationView';
import EditPersonView from '../../../../scripts/manager/views/EditPersonView';
import ManageContributorsView from '../../../../scripts/manager/views/ManageContributorsView';


describe('views/ManageContributorsView', function() {
    var testView;
    var $testDiv;
    var testModel, testRouter;

    var fetchModelDeferred, saveModelDeferred;

    beforeEach(function() {
        $('body').append('<div id="test-div"></div>');
        $testDiv = $('#test-div');

        testModel = new ContributorModel();
        fetchModelDeferred = $.Deferred();
        saveModelDeferred = $.Deferred();
        spyOn(testModel, 'fetch').and.returnValue(fetchModelDeferred.promise());
        spyOn(testModel, 'save').and.returnValue(saveModelDeferred.promise());

        testRouter = jasmine.createSpyObj('routerSpy', ['navigate']);

        spyOn(AlertView.prototype, 'setElement');
        spyOn(AlertView.prototype, 'showSuccessAlert');
        spyOn(AlertView.prototype, 'showDangerAlert');
        spyOn(AlertView.prototype, 'closeAlert');
        spyOn(AlertView.prototype, 'remove');
        spyOn(EditCorporationView.prototype, 'setElement');
        spyOn(EditCorporationView.prototype, 'render');
        spyOn(EditCorporationView.prototype, 'remove');
        spyOn(EditPersonView.prototype, 'setElement');
        spyOn(EditPersonView.prototype, 'render');
        spyOn(EditPersonView.prototype, 'remove');
    });

    afterEach(function() {
        if (testView) {
            testView.remove();
        }
        $testDiv.remove();
    });

    it('Expects that the alertView is created at initialization', function() {
        testView = new ManageContributorsView({
            el : $testDiv,
            model : testModel,
            router : testRouter
        });

        expect(AlertView.prototype.setElement).toHaveBeenCalled();
    });

    it('Expects that the model fetch is not called on a new model', function() {
        testView = new ManageContributorsView({
            el : $testDiv,
            model : testModel,
            router : testRouter
        });

        expect(testModel.fetch).not.toHaveBeenCalled();
    });

    it('Expects that if the id is set in the model, the model is fetched', function() {
        testModel.set('contributorId', 1);
        testView = new ManageContributorsView({
            el : $testDiv,
            model : testModel,
            router : testRouter
        });

        expect(testModel.fetch).toHaveBeenCalled();
    });

    describe('Tests for render for a new contributor', function() {
        beforeEach(function() {
            testView = new ManageContributorsView({
                el : $testDiv,
                model : testModel,
                router : testRouter
            });

            spyOn($.fn, 'select2');
            testView.render();
        });

        it('Expects the alert view\'s setElement to be called', function() {
            expect(AlertView.prototype.setElement.calls.count()).toBe(2);
        });

        it('Expects the select2s to pick contributor type, person, and corporation to be initialized', function() {
            var select2Args = $.fn.select2.calls.all();
            expect($.fn.select2.calls.count()).toBe(3);
            expect(_.find(select2Args, function(arg) {
                return arg.object.hasClass('contributor-type-select');
            })).toBeDefined();
            expect(_.find(select2Args, function(arg) {
                return arg.object.parent().hasClass('person-select-div');
            })).toBeDefined();expect(_.find(select2Args, function(arg) {
                return arg.object.parent().hasClass('corporation-select-div');
            })).toBeDefined();
        });
    });

    describe('Tests for render for an existing person contributor', function() {
        beforeEach(function() {
            testModel.set({
                contributorId: 1,
                corporation: false
            });
            testView = new ManageContributorsView({
                el: $testDiv,
                model: testModel,
                router : testRouter
            });
            testView.render();
        });

        it('Expects that the edit person view is not created and rendered until the model has been fetched', function() {
            expect(EditPersonView.prototype.setElement).not.toHaveBeenCalled();
        });

        it('Expects a failed fetch to show an alert message', function() {
            fetchModelDeferred.reject({
                status : 500,
                statusText : 'Internal Server Error'
            });

            expect(AlertView.prototype.showDangerAlert).toHaveBeenCalled();
        });

        it('Expects that if the fetch is successful an edit person view is created, the select contributor container is hidden and the edit buttons are visible', function() {
            fetchModelDeferred.resolve();

            expect(EditPersonView.prototype.setElement).toHaveBeenCalled();
            expect(EditPersonView.prototype.render).toHaveBeenCalled();
            expect(EditCorporationView.prototype.setElement).not.toHaveBeenCalled();
            expect(EditCorporationView.prototype.render).not.toHaveBeenCalled();
            expect($testDiv.find('.select-contributor-container').is(':visible')).toBe(false);
            expect($testDiv.find('.contributor-button-container').is(':visible')).toBe(true);
        });
    });

    describe('Tests for render for an existing corporation contributor', function() {
        beforeEach(function() {
            testModel.set({
                contributorId: 1,
                corporation: true
            });
            testView = new ManageContributorsView({
                el: $testDiv,
                model: testModel,
                router : testRouter
            });
            testView.render();
        });

        it('Expects that the edit corporation view is not created and rendered until the model has been fetched', function() {
            expect(EditCorporationView.prototype.setElement).not.toHaveBeenCalled();
        });

        it('Expects that if the fetch is successful an edit person view is created, the select contributor container is hidden and the edit buttons are visible', function() {
            fetchModelDeferred.resolve();

            expect(EditPersonView.prototype.setElement).not.toHaveBeenCalled();
            expect(EditPersonView.prototype.render).not.toHaveBeenCalled();
            expect(EditCorporationView.prototype.setElement).toHaveBeenCalled();
            expect(EditCorporationView.prototype.render).toHaveBeenCalled();
        });
    });

    describe('Tests for remove', function() {
        it('Expects that the alertView is removed', function() {
            testView = new ManageContributorsView({
                el: $testDiv,
                model: testModel,
                router : testRouter
            });
            testView.render();
            testView.remove();

            expect(AlertView.prototype.remove).toHaveBeenCalled();
            expect(EditPersonView.prototype.remove).not.toHaveBeenCalled();
            expect(EditCorporationView.prototype.remove).not.toHaveBeenCalled();
        });

        it('Expects that the edit person view to be removed if editing a person', function() {
            testModel.set({
                contributorId: 1,
                corporation: false
            });
            testView = new ManageContributorsView({
                el: $testDiv,
                model: testModel,
                router : testRouter
            });
            fetchModelDeferred.resolve();
            testView.render();
            testView.remove();

            expect(AlertView.prototype.remove).toHaveBeenCalled();
            expect(EditPersonView.prototype.remove).toHaveBeenCalled();
            expect(EditCorporationView.prototype.remove).not.toHaveBeenCalled();
        });

        it('Expects that the edit corporation view to be removed if editing a corporation', function() {
            testModel.set({
                contributorId: 1,
                corporation: true
            });
            testView = new ManageContributorsView({
                el: $testDiv,
                model: testModel,
                router : testRouter
            });
            fetchModelDeferred.resolve();
            testView.render();
            testView.remove();

            expect(AlertView.prototype.remove).toHaveBeenCalled();
            expect(EditPersonView.prototype.remove).not.toHaveBeenCalled();
            expect(EditCorporationView.prototype.remove).toHaveBeenCalled();
        });
    });

    describe('DOM event handlers', function() {
        var $errorDiv;
        var $selectContribToEditDiv;
        var $contributorTypeSelect, $personSelect, $corporationSelect;
        var $createBtn, $saveBtn, $cancelBtn, $createNewBtn;
        beforeEach(function () {
            testView = new ManageContributorsView({
                el: $testDiv,
                model: testModel,
                router: testRouter
            });
            testView.render();
            $errorDiv = $testDiv.find('.validation-errors');
            $selectContribToEditDiv = $testDiv.find('.select-create-or-edit-container');
            $contributorTypeSelect = $testDiv.find('.contributor-type-select');
            $personSelect = $testDiv.find('.person-select-div');
            $corporationSelect = $testDiv.find('.corporation-select-div');
            $createBtn = $testDiv.find('.create-btn');
            $saveBtn = $testDiv.find('.save-btn');
            $cancelBtn = $testDiv.find('.cancel-btn');
            $createNewBtn = $testDiv.find('.create-new-btn');
        });

        it('Expects that clicking the back to search button navigates back to the search page', function () {
            $testDiv.find('.back-to-search-btn').trigger('click');
            expect(testRouter.navigate).toHaveBeenCalled();
            expect(testRouter.navigate.calls.argsFor(0)[0]).toEqual('');
        });

        it('Expects that if a person contributor is selected then the person select is visible', function () {
            $contributorTypeSelect.val('person').trigger('select2:select');

            expect($selectContribToEditDiv.is(':visible')).toBe(true);
            expect($personSelect.is(':visible')).toBe(true);
            expect($corporationSelect.is(':visible')).toBe(false);
        });

        it('Expects that if a corporation contributor is selected then the corporation select is visible', function () {
            $contributorTypeSelect.val('corporation').trigger('select2:select');

            expect($selectContribToEditDiv.is(':visible')).toBe(true);
            expect($personSelect.is(':visible')).toBe(false);
            expect($corporationSelect.is(':visible')).toBe(true);
        });

        it('Expects that clicking the Create button creates an person edit view when selected and sets the model\'s corporation property', function () {
            $contributorTypeSelect.val('person').trigger('select2:select');
            $createBtn.trigger('click');

            expect(EditPersonView.prototype.render).toHaveBeenCalled();
            expect(EditCorporationView.prototype.render).not.toHaveBeenCalled();
            expect(testModel.get('corporation')).toBe(false);
        });

        it('Expects that clicking the Create button creates an corporation edit view when selected and sets the model\'s corporation property', function () {
            $contributorTypeSelect.val('corporation').trigger('select2:select');
            $createBtn.trigger('click');

            expect(EditPersonView.prototype.render).not.toHaveBeenCalled();
            expect(EditCorporationView.prototype.render).toHaveBeenCalled();
            expect(testModel.get('corporation')).toBe(true);
        });

        describe('Tests for selecting a contributor to edit', function() {
            /* Its difficult to simulate the select2 since it is created dynamically. We will call
             * the event handler directly
             */
            var ev;
            beforeEach(function() {
                ev = {
                    currentTarget : {
                        value : '1234'
                    }
                };
            });
            it('Expects that selecting a person fetches that person', function() {
                $contributorTypeSelect.val('person').trigger('select2:select');
                testView.editContributor(ev);

                expect(testModel.get('corporation')).toBe(false);
                expect(testModel.fetch).toHaveBeenCalled();
            });

            it('Expects that if the fetch fails an error message is shown', function() {
                $contributorTypeSelect.val('person').trigger('select2:select');
                testView.editContributor(ev);
                fetchModelDeferred.reject({
                    status : 500,
                    statusText : 'Internal server error'
                });

                expect(AlertView.prototype.showDangerAlert).toHaveBeenCalled();
            });

            it('Expects that a successfully fetch creates a person view and navigates to that contributorId', function() {
                $contributorTypeSelect.val('person').trigger('select2:select');
                testView.editContributor(ev);
                testModel.set('contributorId', 1234);
                fetchModelDeferred.resolve();

                expect(EditPersonView.prototype.render).toHaveBeenCalled();
                expect(EditCorporationView.prototype.render).not.toHaveBeenCalled();
                expect(testRouter.navigate).toHaveBeenCalledWith('contributor/1234');
            });

            it('Expects that selecting a corporation fetches that corproation', function() {
                $contributorTypeSelect.val('corporation').trigger('select2:select');
                testView.editContributor(ev);

                expect(testModel.get('corporation')).toBe(true);
                expect(testModel.fetch).toHaveBeenCalled();
            });

            it('Expects that a successfully fetch creates a corporation view and navigates to that contributorId', function() {
                $contributorTypeSelect.val('corporation').trigger('select2:select');
                testView.editContributor(ev);
                testModel.set('contributorId', 1234);
                fetchModelDeferred.resolve();

                expect(EditPersonView.prototype.render).not.toHaveBeenCalled();
                expect(EditCorporationView.prototype.render).toHaveBeenCalled();
                expect(testRouter.navigate).toHaveBeenCalledWith('contributor/1234');
            });
        });

        it('Expects that clicking the save button clears the error div and saves the model', function() {
            $errorDiv.html('Old errors');
            $saveBtn.trigger('click');

            expect($errorDiv.html()).toEqual('');
            expect(testModel.save).toHaveBeenCalled();
        });

        it('Expects that clicking the save button and then the save fails will show a danger alert', function() {
            $saveBtn.trigger('click');
            saveModelDeferred.reject({
                status : 400,
                statusText : 'Invalid data',
                responseJSON : {validationErrors: {given : 'Needs to be non null'}}
            });

            expect(AlertView.prototype.showDangerAlert).toHaveBeenCalled();
            expect($errorDiv.html()).toContain('{"given":"Needs to be non null"}');
        });

        it('Expects that clicking save followed by a successful save updates the route', function() {
            $saveBtn.trigger('click');
            testModel.set('contributorId', 1234);
            saveModelDeferred.resolve();

            expect(AlertView.prototype.showSuccessAlert).toHaveBeenCalled();
            expect(testRouter.navigate).toHaveBeenCalledWith('contributor/1234');
        });

        it('Expects that clicking the cancel button clears the model but doesn\'t fetch is the model is new', function() {
            spyOn(testModel, 'clear').and.callThrough();
            $cancelBtn.trigger('click');

            expect(testModel.clear).toHaveBeenCalled();
            expect(testModel.fetch).not.toHaveBeenCalled();
        });

        it('Expects that clicking on the cancel button when the model is not new refetches the model', function() {
            testModel.set('contributorId',  1234);
            $cancelBtn.trigger('click');

            expect(testModel.fetch).toHaveBeenCalled();
        });

        it('Expects that if the fetch fails after clicking on the cancel button, the danger alert is shown', function() {
            testModel.set('contributorId',  1234);
            $cancelBtn.trigger('click');
            fetchModelDeferred.reject();
            expect(AlertView.prototype.showDangerAlert).toHaveBeenCalled();
        });

        it('Expects that if the create a new contributor button is clicked, the model is cleared, the select contributor container shown', function() {
            spyOn(testModel, 'clear').and.callThrough();
            $contributorTypeSelect.val('corporation').trigger('select2:select');
            testView.editContributor({
                currentTarget : {value : 1234}
            });
            fetchModelDeferred.resolve();
            $createNewBtn.trigger('click');

            expect(testModel.clear).toHaveBeenCalled();
            expect(EditCorporationView.prototype.remove).toHaveBeenCalled();
            expect($testDiv.find('.select-contributor-container').is(':visible')).toBe(true);
            expect($testDiv.find('.contributor-button-container').is(':visible')).toBe(false);
        });
    });
});
