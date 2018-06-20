import 'bootstrap';

import Squire from 'squire';
import $ from 'jquery';

import BaseView from '../../../../scripts/manager/views/BaseView';
import PublicationModel from '../../../../scripts/manager/models/PublicationModel';


jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;  // Set to 20 seconds. Seems to need a larger timeout interval when

// running on Jenkins.
describe('PublicationView', function(){
    var PublicationView;
    var testView;

    var setElAlertSpy, renderAlertSpy, removeAlertSpy, dangerAlertSpy, successAlertSpy;
    var setElLoginDialogSpy, renderLoginDialogSpy, removeLoginDialogSpy, showLoginDialogSpy;
    var setElDialogSpy, renderDialogSpy, removeDialogSpy, showDialogSpy;
    var setElBibliodataSpy, renderBibliodataSpy, removeBibliodataSpy, findElBibliodataSpy;
    var setElLinksSpy, renderLinksSpy, removeLinksSpy, findElLinksSpy;
    var setElContributorsSpy, renderContributorsSpy, removeContributorsSpy, findElContributorsSpy;
    var setElSPNSpy, renderSPNSpy, removeSPNSpy, findElSPNSpy;
    var setElCatalogingSpy, renderCatalogingSpy, removeCatalogingSpy, findElCatalogingSpy;
    var setElGeospatialSpy, renderGeospatialSpy, removeGeospatialSpy, findElGeospatialSpy;
    var initTinyMceDeferred;

    var pubModel;
    var opDeferred;

    var injector;

    beforeEach(function(done) {
        $('body').append('<div id="test-div"></div>');

        opDeferred = $.Deferred();
        initTinyMceDeferred = $.Deferred();

        pubModel = new PublicationModel();
        spyOn(pubModel, 'fetch').and.returnValue(opDeferred.promise());
        spyOn(pubModel, 'save').and.returnValue(opDeferred.promise());
        spyOn(pubModel, 'release').and.returnValue(opDeferred.promise());
        spyOn(pubModel, 'publish').and.returnValue(opDeferred.promise());
        spyOn(pubModel, 'destroy').and.returnValue(opDeferred.promise());

        setElAlertSpy = jasmine.createSpy('setElAlertSpy');
        renderAlertSpy = jasmine.createSpy('renderAlertSpy');
        removeAlertSpy = jasmine.createSpy('removeAlertSpy');
        dangerAlertSpy = jasmine.createSpy('dangerAlertSpy');
        successAlertSpy = jasmine.createSpy('successAlertSpy');

        setElLoginDialogSpy = jasmine.createSpy('setElLoginDialogSpy');
        renderLoginDialogSpy = jasmine.createSpy('renderLoginDialogSpy');
        removeLoginDialogSpy = jasmine.createSpy('removeLoginDialogSpy');
        showLoginDialogSpy = jasmine.createSpy('showLoginDialogSpy');

        setElDialogSpy = jasmine.createSpy('setElDialogSpy');
        renderDialogSpy = jasmine.createSpy('renderDialogSpy');
        removeDialogSpy = jasmine.createSpy('removeDialogSpy');
        showDialogSpy = jasmine.createSpy('showDialogSpy');

        setElBibliodataSpy = jasmine.createSpy('setElBibliodataSpy');
        renderBibliodataSpy = jasmine.createSpy('renderBibliodataSpy');
        removeBibliodataSpy = jasmine.createSpy('removeBibliodataSpy');
        findElBibliodataSpy = jasmine.createSpy('findElBibliodataSpy').and.returnValue({
            tooltip : jasmine.createSpy()
        });

        setElLinksSpy = jasmine.createSpy('setElLinksdataSpy');
        renderLinksSpy = jasmine.createSpy('renderLinksSpy');
        removeLinksSpy = jasmine.createSpy('removeLinksSpy');
        findElLinksSpy = jasmine.createSpy('findElLinksSpy').and.returnValue({
            tooltip : jasmine.createSpy()
        });

        setElContributorsSpy = jasmine.createSpy('setElContributorsSpy');
        renderContributorsSpy = jasmine.createSpy('renderContributorsSpy');
        removeContributorsSpy = jasmine.createSpy('removeContributorsSpy');
        findElContributorsSpy = jasmine.createSpy('findElContributorsSpy').and.returnValue({
            tooltip : jasmine.createSpy()
        });

        setElSPNSpy = jasmine.createSpy('setElSPNdataSpy');
        renderSPNSpy = jasmine.createSpy('renderSPNSpy');
        removeSPNSpy = jasmine.createSpy('removeSPNSpy');
        findElSPNSpy = jasmine.createSpy('findElSPNSpy').and.returnValue({
            tooltip : jasmine.createSpy()
        });

        setElCatalogingSpy = jasmine.createSpy('setElCatalogingdataSpy');
        renderCatalogingSpy = jasmine.createSpy('renderCatalogingSpy');
        removeCatalogingSpy = jasmine.createSpy('removeCatalogingSpy');
        findElCatalogingSpy = jasmine.createSpy('findElCatalogingSpy').and.returnValue({
            tooltip : jasmine.createSpy()
        });

        setElGeospatialSpy = jasmine.createSpy('setElGeospatialdataSpy');
        renderGeospatialSpy = jasmine.createSpy('renderGeospatialSpy');
        removeGeospatialSpy = jasmine.createSpy('removeGeospatialSpy');
        findElGeospatialSpy = jasmine.createSpy('findElGeospatialpy').and.returnValue({
            tooltip : jasmine.createSpy()
        });


        injector = new Squire();
        injector.mock('jquery', $);
        injector.mock('views/AlertView', BaseView.extend({
            setElement : setElAlertSpy,
            render : renderAlertSpy,
            remove : removeAlertSpy,
            showDangerAlert : dangerAlertSpy,
            showSuccessAlert : successAlertSpy
        }));
        injector.mock('views/LoginDialogView', BaseView.extend({
            setElement : setElLoginDialogSpy.and.returnValue({
                render : renderLoginDialogSpy
            }),
            render : renderLoginDialogSpy,
            remove : removeLoginDialogSpy,
            show : showLoginDialogSpy
        }));
        injector.mock('views/ConfirmationDialogView', BaseView.extend({
            setElement : setElDialogSpy.and.returnValue({
                render : renderDialogSpy
            }),
            render : renderDialogSpy,
            remove : removeDialogSpy,
            show : showDialogSpy
        }));
        injector.mock('views/BibliodataView', BaseView.extend({
            setElement : setElBibliodataSpy.and.returnValue({
                render : renderBibliodataSpy
            }),
            render : renderBibliodataSpy,
            remove : removeBibliodataSpy,
            $ : findElBibliodataSpy,
            initializeTinyMce : jasmine.createSpy('initializeTinyMceBibliodataView').and.returnValue(initTinyMceDeferred.promise())
        }));
        injector.mock('views/LinksView', BaseView.extend({
            setElement : setElLinksSpy.and.returnValue({
                render : renderLinksSpy
            }),
            render : renderLinksSpy,
            remove : removeLinksSpy,
            $ : findElLinksSpy
        }));
        injector.mock('views/ContributorsView', BaseView.extend({
            setElement : setElContributorsSpy.and.returnValue({
                render : renderContributorsSpy
            }),
            render : renderContributorsSpy,
            remove : removeContributorsSpy,
            $ : findElContributorsSpy
        }));
        injector.mock('views/SPNView', BaseView.extend({
            setElement : setElSPNSpy.and.returnValue({
                render : renderSPNSpy
            }),
            render : renderSPNSpy,
            remove : removeSPNSpy,
            $ : findElSPNSpy,
            initializeTinyMce : jasmine.createSpy('initializeTinyMceSPNView').and.returnValue(initTinyMceDeferred.promise())
        }));
        injector.mock('views/CatalogingView', BaseView.extend({
            setElement : setElCatalogingSpy.and.returnValue({
                render : renderCatalogingSpy
            }),
            render : renderCatalogingSpy,
            remove : removeCatalogingSpy,
            $ : findElCatalogingSpy
        }));
        injector.mock('views/GeospatialView', BaseView.extend({
            setElement : setElGeospatialSpy.and.returnValue({
                render : renderGeospatialSpy
            }),
            render : renderGeospatialSpy,
            remove : removeGeospatialSpy,
            $ : findElGeospatialSpy
        }));

        injector.require(['views/PublicationView'], function(view){
            PublicationView = view;
            done();
        });
    });

    afterEach(function() {
        injector.remove();
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

            expect(setElAlertSpy.calls.count()).toBe(2);
            expect(renderAlertSpy).not.toHaveBeenCalled();
            expect(setElLoginDialogSpy.calls.count()).toBe(2);
            expect(renderLoginDialogSpy).toHaveBeenCalled();
            expect(setElDialogSpy.calls.count()).toBe(2);
            expect(renderDialogSpy).toHaveBeenCalled();
        });

        it('Expects the child tab views to not be rendered until a successful fetch occurs', function() {
            pubModel.set('id', 1234);
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            }).render();

            expect(setElBibliodataSpy.calls.count()).toBe(1);
            expect(renderBibliodataSpy).not.toHaveBeenCalled();
            expect(setElLinksSpy.calls.count()).toBe(1);
            expect(renderLinksSpy).not.toHaveBeenCalled();
            expect(setElContributorsSpy.calls.count()).toBe(1);
            expect(renderContributorsSpy).not.toHaveBeenCalled();
            expect(setElSPNSpy.calls.count()).toBe(1);
            expect(renderSPNSpy).not.toHaveBeenCalled();
            expect(setElCatalogingSpy.calls.count()).toBe(1);
            expect(renderCatalogingSpy).not.toHaveBeenCalled();
            expect(setElGeospatialSpy.calls.count()).toBe(1);
            expect(renderGeospatialSpy).not.toHaveBeenCalled();

            opDeferred.resolve();

            expect(setElBibliodataSpy.calls.count()).toBe(2);
            expect(renderBibliodataSpy).toHaveBeenCalled();
            expect(setElLinksSpy.calls.count()).toBe(2);
            expect(renderLinksSpy).toHaveBeenCalled();
            expect(setElContributorsSpy.calls.count()).toBe(2);
            expect(renderContributorsSpy).toHaveBeenCalled();
            expect(setElSPNSpy.calls.count()).toBe(2);
            expect(renderSPNSpy).toHaveBeenCalled();
            expect(setElCatalogingSpy.calls.count()).toBe(2);
            expect(renderCatalogingSpy).toHaveBeenCalled();
            expect(setElGeospatialSpy.calls.count()).toBe(2);
            expect(renderGeospatialSpy).toHaveBeenCalled();
        });

        it('Expects a successful fetch will not show an alert', function() {
            pubModel.set('id', 1234);
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            }).render();
            opDeferred.resolve();
            expect(dangerAlertSpy).not.toHaveBeenCalled();
        });

        it('Expects a failed fetch to show an alert but not to show the tab views', function() {
            pubModel.set('id', 1234);
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            }).render();
            opDeferred.reject({status : 500, statusText : 'Error text'});
            expect(dangerAlertSpy).toHaveBeenCalled();
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
            expect(dangerAlertSpy).not.toHaveBeenCalled();
        });
    });

    describe('Tests for remove', function() {
        it('Expects remove to call the child view remove functions', function() {
            testView = new PublicationView({
                model : pubModel,
                el : '#test-div'
            });
            testView.remove();
            expect(removeAlertSpy).toHaveBeenCalled();
            expect(removeLoginDialogSpy).toHaveBeenCalled();
            expect(removeDialogSpy).toHaveBeenCalled();
            expect(removeBibliodataSpy).toHaveBeenCalled();
            expect(removeLinksSpy).toHaveBeenCalled();
            expect(removeContributorsSpy).toHaveBeenCalled();
            expect(removeSPNSpy).toHaveBeenCalled();
            expect(removeCatalogingSpy).toHaveBeenCalled();
            expect(removeGeospatialSpy).toHaveBeenCalled();
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
            expect(dangerAlertSpy).not.toHaveBeenCalled();
            opDeferred.reject('Error message');
            expect(dangerAlertSpy).toHaveBeenCalled();
        });

        it('Expects that if release fails with a status of 401, the loginDialogView is shown', function() {
            testView.releasePub();
            expect(showLoginDialogSpy).not.toHaveBeenCalled();
            opDeferred.reject({status : 401});
            expect(showLoginDialogSpy).toHaveBeenCalled();
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
            expect(successAlertSpy).not.toHaveBeenCalled();
            opDeferred.resolve();
            expect(successAlertSpy).toHaveBeenCalled();
        });

        it('Expects that if the save contains validation errors, the model is updated with the errors and a danger alert is shown', function() {
            testView.savePub();
            expect(dangerAlertSpy).not.toHaveBeenCalled();
            opDeferred.reject({
                responseJSON: {
                    validationErrors: ['One error']
                }
            });
            expect(pubModel.get('validationErrors')).toEqual(['One error']);
            expect(dangerAlertSpy).toHaveBeenCalled();
        });

        it('Expects that if the save fails without validation errors, the model is not updated and the danger alert is shown', function() {
            testView.savePub();
            expect(dangerAlertSpy).not.toHaveBeenCalled();
            opDeferred.reject({}, 'error', 'Server error');
            expect(pubModel.has('validationErrors')).toBe(false);
            expect(dangerAlertSpy).toHaveBeenCalled();
        });

        it('Expects that if the save fails with a 401 status, the loginDialog is shown', function() {
            testView.savePub();
            expect(showLoginDialogSpy).not.toHaveBeenCalled();
            opDeferred.reject({status : 401});
            expect(showLoginDialogSpy).toHaveBeenCalled();
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
            expect(showDialogSpy).not.toHaveBeenCalled();
        });

        it('Expects a successful call to save to call the confirmation dialog', function() {
            testView.publishPub();
            savePubDeferred.resolve();
            expect(showDialogSpy).toHaveBeenCalled();
        });

        describe('Tests for publishing a pub where the save has already worked', function() {
            beforeEach(function () {
                var actionCallback;
                testView.publishPub();
                savePubDeferred.resolve();

                actionCallback = showDialogSpy.calls.argsFor(0)[1];
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
                expect(dangerAlertSpy).toHaveBeenCalled();
            });

            it('Expects a failed call with a status of 401 shows the login dialog', function() {
                expect(showLoginDialogSpy).not.toHaveBeenCalled();
                opDeferred.reject({status : 401});
                expect(showLoginDialogSpy).toHaveBeenCalled();
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
            expect(showDialogSpy).toHaveBeenCalled();
        });

        it('Expects the action callback to delete the publication', function() {
            var actionCallback;
            pubModel.set('id', 1234);
            testView.deletePub();
            actionCallback = showDialogSpy.calls.argsFor(0)[1];
            // This mocks what would happen if the confirmation dialog is confirmed.
            actionCallback();
            expect(pubModel.destroy).toHaveBeenCalled();
        });

        it('Expects a successful delete to return to the search page', function() {
            var actionCallback;
            pubModel.set('id', 1234);
            testView.deletePub();
            actionCallback = showDialogSpy.calls.argsFor(0)[1];
            // This mocks what would happen if the confirmation dialog is confirmed.
            actionCallback();

            opDeferred.resolve();
            expect(testView.returnToSearch).toHaveBeenCalled();
        });

        it('Expects a failed delete to show the danger alert', function() {
            var actionCallback;
            pubModel.set('id', 1234);
            testView.deletePub();
            actionCallback = showDialogSpy.calls.argsFor(0)[1];
            // This mocks what would happen if the confirmation dialog is confirmed.
            actionCallback();

            opDeferred. reject({
                statusText : 'Delete error'
            });

            expect(dangerAlertSpy).toHaveBeenCalled();
        });

        it('Expects a failed delete with a status of 401 shows the login dialog', function() {
            var actionCallback;
            pubModel.set('id', 1234);
            testView.deletePub();
            actionCallback = showDialogSpy.calls.argsFor(0)[1];
            // This mocks what would happen if the confirmation dialog is confirmed.
            actionCallback();

            expect(showLoginDialogSpy).not.toHaveBeenCalled();
            opDeferred. reject({status : 401});
            expect(showLoginDialogSpy).toHaveBeenCalled();
        });
    });
});
