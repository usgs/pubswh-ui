import 'bootstrap';

import $ from 'jquery';

import AlertView from '../../../../scripts/manager/views/AlertView';
import BibliodataView from '../../../../scripts/manager/views/BibliodataView';
import CatalogingView from '../../../../scripts/manager/views/CatalogingView';
import ConfirmationDialogView from '../../../../scripts/manager/views/ConfirmationDialogView';
import ContributorsView from '../../../../scripts/manager/views/ContributorsView';
import GeospatialView from '../../../../scripts/manager/views/GeospatialView';
import LinksView from '../../../../scripts/manager/views/LinksView';
import LoginDialogView from '../../../../scripts/manager/views/LoginDialogView';
import PublicationModel from '../../../../scripts/manager/models/PublicationModel';
import PublicationView from '../../../../scripts/manager/views/PublicationView';
import SPNView from '../../../../scripts/manager/views/SPNView';


jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;  // Set to 20 seconds. Seems to need a larger timeout interval when

// running on Jenkins.
describe('PublicationView', function(){
    var testView;

    var renderLoginDialogSpy;
    var renderDialogSpy;
    var renderBibliodataSpy;
    var renderLinksSpy;
    var renderContributorsSpy;
    var renderSPNSpy;
    var renderCatalogingSpy;
    var renderGeospatialSpy;
    var initTinyMceDeferred;

    var pubModel;
    var opDeferred;

    beforeEach(function() {
        $('body').append('<div id="test-div"></div>');

        opDeferred = $.Deferred();
        initTinyMceDeferred = $.Deferred();

        pubModel = new PublicationModel();
        spyOn(pubModel, 'fetch').and.returnValue(opDeferred.promise());
        spyOn(pubModel, 'save').and.returnValue(opDeferred.promise());
        spyOn(pubModel, 'release').and.returnValue(opDeferred.promise());
        spyOn(pubModel, 'publish').and.returnValue(opDeferred.promise());
        spyOn(pubModel, 'destroy').and.returnValue(opDeferred.promise());

        renderDialogSpy = jasmine.createSpy('renderDialogSpy');
        renderLoginDialogSpy = jasmine.createSpy('renderLoginDialogSpy');
        renderBibliodataSpy = jasmine.createSpy('renderBibliodataSpy');
        renderLinksSpy = jasmine.createSpy('renderLinksSpy');
        renderContributorsSpy = jasmine.createSpy('renderContributorsSpy');
        renderSPNSpy = jasmine.createSpy('renderSPNSpy');
        renderCatalogingSpy = jasmine.createSpy('renderCatalogingSpy');
        renderGeospatialSpy = jasmine.createSpy('renderGeospatialSpy');

        var mockJquery = {
            tooltip : jasmine.createSpy()
        };

        spyOn(AlertView.prototype, 'setElement');
        spyOn(AlertView.prototype, 'render');
        spyOn(AlertView.prototype, 'remove');
        spyOn(AlertView.prototype, 'showDangerAlert');
        spyOn(AlertView.prototype, 'showSuccessAlert');
        spyOn(LoginDialogView.prototype, 'setElement').and.returnValue({
            render : renderLoginDialogSpy
        });
        spyOn(LoginDialogView.prototype, 'render').and.callFake(renderLoginDialogSpy);
        spyOn(LoginDialogView.prototype, 'remove');
        spyOn(LoginDialogView.prototype, 'show');
        spyOn(ConfirmationDialogView.prototype, 'setElement').and.returnValue({
            render : renderDialogSpy
        });
        spyOn(ConfirmationDialogView.prototype, 'render').and.callFake(renderDialogSpy);
        spyOn(ConfirmationDialogView.prototype, 'remove');
        spyOn(ConfirmationDialogView.prototype, 'show');
        spyOn(BibliodataView.prototype, 'setElement').and.returnValue({
            render : renderBibliodataSpy
        });
        spyOn(BibliodataView.prototype, 'render').and.callFake(renderBibliodataSpy);
        spyOn(BibliodataView.prototype, 'remove');
        spyOn(BibliodataView.prototype, 'initializeTinyMce').and.returnValue(initTinyMceDeferred.promise());
        spyOn(BibliodataView.prototype, '$').and.returnValue(mockJquery);
        spyOn(LinksView.prototype, 'setElement').and.returnValue({
            render : renderLinksSpy
        });
        spyOn(LinksView.prototype, 'render').and.callFake(renderLinksSpy);
        spyOn(LinksView.prototype, 'remove');
        spyOn(LinksView.prototype, '$').and.returnValue(mockJquery);
        spyOn(ContributorsView.prototype, 'setElement').and.returnValue({
            render : renderContributorsSpy
        });
        spyOn(ContributorsView.prototype, 'render').and.callFake(renderContributorsSpy);
        spyOn(ContributorsView.prototype, 'remove');
        spyOn(ContributorsView.prototype, '$').and.returnValue(mockJquery);
        spyOn(SPNView.prototype, 'setElement').and.returnValue({
            render : renderSPNSpy
        });
        spyOn(SPNView.prototype, 'render').and.callFake(renderSPNSpy);
        spyOn(SPNView.prototype, 'remove');
        spyOn(SPNView.prototype, 'initializeTinyMce').and.returnValue(initTinyMceDeferred.promise());
        spyOn(SPNView.prototype, '$').and.returnValue(mockJquery);
        spyOn(CatalogingView.prototype, 'setElement').and.returnValue({
            render : renderCatalogingSpy
        });
        spyOn(CatalogingView.prototype, 'render').and.callFake(renderCatalogingSpy);
        spyOn(CatalogingView.prototype, 'remove');
        spyOn(CatalogingView.prototype, '$').and.returnValue(mockJquery);
        spyOn(GeospatialView.prototype, 'setElement').and.returnValue({
            render : renderGeospatialSpy
        });
        spyOn(GeospatialView.prototype, 'render').and.callFake(renderGeospatialSpy);
        spyOn(GeospatialView.prototype, 'remove');
        spyOn(GeospatialView.prototype, '$').and.returnValue(mockJquery);
    });

    afterEach(function() {
        testView.remove();
        $('#test-div').remove();
    });

    it('Expects that when creating a view with a new model, the model\'s fetch is not called', function() {
        testView = new PublicationView({
            model : pubModel,
            el : '#test-div'
        });
        expect(pubModel.fetch).not.toHaveBeenCalled();
    });

    it('Expects that when creating a view with a model, the model\'s fetch is called', function() {
        pubModel.set('id', 1234);
        testView = new PublicationView({
            model : pubModel,
            el : '#test-div'
        });
        expect(pubModel.fetch).toHaveBeenCalled();
    });

    describe('Tests for render', function() {
        it('Expects the confirmationDialogView and loginDialogView to be rendered and the alertView to have it\'s element set', function() {
            pubModel.set('id', 1234);
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            }).render();

            expect(AlertView.prototype.setElement.calls.count()).toBe(2);
            expect(AlertView.prototype.render).not.toHaveBeenCalled();
            expect(LoginDialogView.prototype.setElement.calls.count()).toBe(2);
            expect(renderLoginDialogSpy).toHaveBeenCalled();
            expect(ConfirmationDialogView.prototype.setElement.calls.count()).toBe(2);
            expect(renderDialogSpy).toHaveBeenCalled();
        });

        fit('Expects the child tab views to not be rendered until a successful fetch occurs', function() {
            pubModel.set('id', 1234);
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            }).render();

            expect(BibliodataView.prototype.setElement.calls.count()).toBe(1);
            expect(renderBibliodataSpy).not.toHaveBeenCalled();
            expect(LinksView.prototype.setElement.calls.count()).toBe(1);
            expect(renderLinksSpy).not.toHaveBeenCalled();
            expect(ContributorsView.prototype.setElement.calls.count()).toBe(1);
            expect(renderContributorsSpy).not.toHaveBeenCalled();
            expect(SPNView.prototype.setElement.calls.count()).toBe(1);
            expect(renderSPNSpy).not.toHaveBeenCalled();
            expect(CatalogingView.prototype.setElement.calls.count()).toBe(1);
            expect(renderCatalogingSpy).not.toHaveBeenCalled();
            expect(GeospatialView.prototype.setElement.calls.count()).toBe(1);
            expect(renderGeospatialSpy).not.toHaveBeenCalled();

            opDeferred.resolve();

            expect(BibliodataView.prototype.setElement.calls.count()).toBe(2);
            expect(renderBibliodataSpy).toHaveBeenCalled();
            expect(LinksView.prototype.setElement.calls.count()).toBe(2);
            expect(renderLinksSpy).toHaveBeenCalled();
            expect(ContributorsView.prototype.setElement.calls.count()).toBe(2);
            expect(renderContributorsSpy).toHaveBeenCalled();
            expect(SPNView.prototype.setElement.calls.count()).toBe(2);
            expect(renderSPNSpy).toHaveBeenCalled();
            expect(CatalogingView.prototype.setElement.calls.count()).toBe(2);
            expect(renderCatalogingSpy).toHaveBeenCalled();
            expect(GeospatialView.prototype.setElement.calls.count()).toBe(2);
            expect(renderGeospatialSpy).toHaveBeenCalled();
        });

        it('Expects a successful fetch will not show an alert', function() {
            pubModel.set('id', 1234);
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            }).render();
            opDeferred.resolve();
            expect(AlertView.prototype.showDangerAlert).not.toHaveBeenCalled();
        });

        it('Expects a failed fetch to show an alert but not to show the tab views', function() {
            pubModel.set('id', 1234);
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            }).render();
            opDeferred.reject({status : 500, statusText : 'Error text'});
            expect(AlertView.prototype.showDangerAlert).toHaveBeenCalled();
            expect(renderBibliodataSpy).not.toHaveBeenCalled();
            expect(renderLinksSpy).not.toHaveBeenCalled();
            expect(renderContributorsSpy).not.toHaveBeenCalled();
            expect(renderSPNSpy).not.toHaveBeenCalled();
            expect(renderCatalogingSpy).not.toHaveBeenCalled();
            expect(renderGeospatialSpy).not.toHaveBeenCalled();
        });

        it('Expects a failed fetch with status 409 to show the locked dialog', function() {
            pubModel.set('id', 1234);
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            }).render();
            spyOn($.fn, 'modal');
            opDeferred.reject({status : 409, responseJSON : {validationErrors : [{message : 'Locked'}]}});
            expect($.fn.modal).toHaveBeenCalled();
            expect($('.locked-pub-dialog-container .modal-body').html()).toContain('Locked');
        });

        it('Expects a new pub to not show an alert', function() {
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            }).render();
            expect(AlertView.prototype.showDangerAlert).not.toHaveBeenCalled();
        });
    });

    describe('Tests for remove', function() {
        it('Expects remove to call the child view remove functions', function() {
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            });
            testView.remove();
            expect(AlertView.prototype.remove).toHaveBeenCalled();
            expect(LoginDialogView.prototype.remove).toHaveBeenCalled();
            expect(ConfirmationDialogView.prototype.remove).toHaveBeenCalled();
            expect(BibliodataView.prototype.remove).toHaveBeenCalled();
            expect(LinksView.prototype.remove).toHaveBeenCalled();
            expect(ContributorsView.prototype.remove).toHaveBeenCalled();
            expect(SPNView.prototype.remove).toHaveBeenCalled();
            expect(CatalogingView.prototype.remove).toHaveBeenCalled();
            expect(GeospatialView.prototype.remove).toHaveBeenCalled();
        });
    });

    describe('Tests for IPDS ID Changes', function() {

        beforeEach(function() {
            testView = new PublicationView({
                model : pubModel,
                el: '#test-div'
            }).render();
        });

        it('Expects the IPDS ID field to be editable when there is no IPDS ID value', function() {
            expect(testView.$('#ipds-input').is('[readonly]')).toBe(false);
        });

        it('Expects the IPDS ID field to be readonly there is an IPDS value set and synced', function() {
            pubModel.set('ipdsId', 'IP-098765');
            pubModel.trigger('sync');

            expect(testView.$('#ipds-input').is('[readonly]')).toBe(true);
        });
    });

    describe('Tests for updating the model id', function() {
        beforeEach(function() {
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            }).render();
            testView.context.previewUrl = '/preview/';
        });

        it('Expects the preview div to be shown if the id is non null and hidden if it is null', function() {
            expect(testView.$('#pub-preview-div').is(':visible')).toBe(false);

            pubModel.set('id', 1234);
            pubModel.set('indexId', 'ds1234');
            expect(testView.$('#pub-preview-div').is(':visible')).toBe(true);
            expect(testView.$('#pub-preview-div a').attr('href')).toMatch('ds1234');

            pubModel.set('id', '');
        });
    });

    describe('Tests for releasing a pub', function() {
        beforeEach(function() {
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            });
            spyOn(testView, 'returnToSearch');
        });

        it('Expects that if release succeeds the route is changed to search', function() {
            testView.releasePub();
            expect(pubModel.release).toHaveBeenCalled();
            expect(testView.returnToSearch).not.toHaveBeenCalled();
            opDeferred.resolve();
            expect(testView.returnToSearch).toHaveBeenCalled();
        });

        it('Expects that if release fails an alert is shown', function() {
            testView.releasePub();
            expect(AlertView.prototype.showDangerAlert).not.toHaveBeenCalled();
            opDeferred.reject('Error message');
            expect(AlertView.prototype.showDangerAlert).toHaveBeenCalled();
        });

        it('Expects that if release fails with a status of 401, the loginDialogView is shown', function() {
            testView.releasePub();
            expect(LoginDialogView.prototype.show).not.toHaveBeenCalled();
            opDeferred.reject({status : 401});
            expect(LoginDialogView.prototype.show).toHaveBeenCalled();
        });
    });

    describe('Tests for saving a pub', function() {
        beforeEach(function() {
            pubModel.set('id', 1234);
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            });
        });

        it('Expects that if the save succeeds a success alert is shown', function() {
            testView.savePub();
            expect(AlertView.prototype.showSuccessAlert).not.toHaveBeenCalled();
            opDeferred.resolve();
            expect(AlertView.prototype.showSuccessAlert).toHaveBeenCalled();
        });

        it('Expects that if the save contains validation errors, the model is updated with the errors and a danger alert is shown', function() {
            testView.savePub();
            expect(AlertView.prototype.showDangerAlert).not.toHaveBeenCalled();
            opDeferred.reject({
                responseJSON: {
                    validationErrors: ['One error']
                }
            });
            expect(pubModel.get('validationErrors')).toEqual(['One error']);
            expect(AlertView.prototype.showDangerAlert).toHaveBeenCalled();
        });

        it('Expects that if the save fails without validation errors, the model is not updated and the danger alert is shown', function() {
            testView.savePub();
            expect(AlertView.prototype.showDangerAlert).not.toHaveBeenCalled();
            opDeferred.reject({}, 'error', 'Server error');
            expect(pubModel.has('validationErrors')).toBe(false);
            expect(AlertView.prototype.showDangerAlert).toHaveBeenCalled();
        });

        it('Expects that if the save fails with a 401 status, the loginDialog is shown', function() {
            testView.savePub();
            expect(LoginDialogView.prototype.show).not.toHaveBeenCalled();
            opDeferred.reject({status : 401});
            expect(LoginDialogView.prototype.show).toHaveBeenCalled();
        });
    });

    describe('Tests for publishing a pub', function() {
        var savePubDeferred;

        beforeEach(function() {
            savePubDeferred = $.Deferred();
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            });

            spyOn(testView, 'savePub').and.returnValue(savePubDeferred.promise());
            spyOn(testView, 'returnToSearch');
        });

        it('Expects that a call to publishPub first calls savePub', function() {
            testView.publishPub();
            expect(testView.savePub).toHaveBeenCalled();
        });

        it('Expects a failed call to save to not call the confirmation dialog or the model\'s publish', function() {
            testView.publishPub();
            savePubDeferred.reject('an error');
            expect(ConfirmationDialogView.prototype.show).not.toHaveBeenCalled();
        });

        it('Expects a successful call to save to call the confirmation dialog', function() {
            testView.publishPub();
            savePubDeferred.resolve();
            expect(ConfirmationDialogView.prototype.show).toHaveBeenCalled();
        });

        describe('Tests for publishing a pub where the save has already worked', function() {
            beforeEach(function () {
                var actionCallback;
                testView.publishPub();
                savePubDeferred.resolve();

                actionCallback = ConfirmationDialogView.prototype.show.calls.argsFor(0)[1];
                //This mocks what would happen if the confirmation dialog is confirmed.
                actionCallback();
            });


            it('Expects the confirmation dialog\'s action procedure to call the model\'s publish', function () {
                expect(pubModel.publish).toHaveBeenCalled();
            });

            it('Expects that if publish is successful return to the search page', function () {
                opDeferred.resolve();
                expect(testView.returnToSearch).toHaveBeenCalled();
            });

            it('Expects that if publish fails, the danger alert is shown', function() {
                opDeferred.reject('Has error');
                expect(AlertView.prototype.showDangerAlert).toHaveBeenCalled();
            });

            it('Expects a failed call with a status of 401 shows the login dialog', function() {
                expect(LoginDialogView.prototype.show).not.toHaveBeenCalled();
                opDeferred.reject({status : 401});
                expect(LoginDialogView.prototype.show).toHaveBeenCalled();
            });
        });
    });

    describe('Tests for deletePub', function() {

        beforeEach(function() {
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            });
            spyOn(testView, 'returnToSearch');
        });

        it('Expects the view to return to the search page if the publication is new', function() {
            testView.deletePub();
            expect(testView.returnToSearch).toHaveBeenCalled();
        });

        it('Expects the confirmation dialog to be shown if the publication is not new', function() {
            pubModel.set('id', 1234);
            testView.deletePub();
            expect(ConfirmationDialogView.prototype.show).toHaveBeenCalled();
        });

        it('Expects the action callback to delete the publication', function() {
            var actionCallback;
            pubModel.set('id', 1234);
            testView.deletePub();
            actionCallback = ConfirmationDialogView.prototype.show.calls.argsFor(0)[1];
            // This mocks what would happen if the confirmation dialog is confirmed.
            actionCallback();
            expect(pubModel.destroy).toHaveBeenCalled();
        });

        it('Expects a successful delete to return to the search page', function() {
            var actionCallback;
            pubModel.set('id', 1234);
            testView.deletePub();
            actionCallback = ConfirmationDialogView.prototype.show.calls.argsFor(0)[1];
            // This mocks what would happen if the confirmation dialog is confirmed.
            actionCallback();

            opDeferred.resolve();
            expect(testView.returnToSearch).toHaveBeenCalled();
        });

        it('Expects a failed delete to show the danger alert', function() {
            var actionCallback;
            pubModel.set('id', 1234);
            testView.deletePub();
            actionCallback = ConfirmationDialogView.prototype.show.calls.argsFor(0)[1];
            // This mocks what would happen if the confirmation dialog is confirmed.
            actionCallback();

            opDeferred. reject({
                statusText : 'Delete error'
            });

            expect(AlertView.prototype.showDangerAlert).toHaveBeenCalled();
        });

        it('Expects a failed delete with a status of 401 shows the login dialog', function() {
            var actionCallback;
            pubModel.set('id', 1234);
            testView.deletePub();
            actionCallback = ConfirmationDialogView.prototype.show.calls.argsFor(0)[1];
            // This mocks what would happen if the confirmation dialog is confirmed.
            actionCallback();

            expect(LoginDialogView.prototype.show).not.toHaveBeenCalled();
            opDeferred. reject({status : 401});
            expect(LoginDialogView.prototype.show).toHaveBeenCalled();
        });
    });
});
