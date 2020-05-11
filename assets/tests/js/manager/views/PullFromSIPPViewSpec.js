
import PullFromSippView from '../../../../scripts/manager/views/PullFromSIPPView';
import AlertView from '../../../../scripts/manager/views/AlertView';

describe('views/PullFromSippView', () => {
    let server, testView, testRouter, $testDiv, $btn, $ipNo, $loadingIndicator;

    beforeEach(function() {
        server = sinon.fakeServer.create();
        testRouter = jasmine.createSpyObj('testRouterSpy', ['navigate']);

        spyOn(AlertView.prototype, 'setElement');
        spyOn(AlertView.prototype, 'showSuccessAlert');
        spyOn(AlertView.prototype, 'showDangerAlert');
        spyOn(AlertView.prototype, 'remove');

        $('body').append('<div id="test-div"></div>');
        $testDiv = $('#test-div');
        testView = new PullFromSippView({
            el: $testDiv,
            router: testRouter
        });
        testView.render();

        $ipNo = testView.$('#ip-number');
        $btn = testView.$('.pull-from-sipp-btn');
        $loadingIndicator = testView.$('.loading-indicator');
    });

    afterEach(function() {
        if (testView) {
            testView.remove();
        }
        $testDiv.remove();

        server.restore();
    });

    it('Expects that the alertView has been created', function() {
        expect(AlertView.prototype.setElement).toHaveBeenCalled();
    });

    it('Expects that a call to remove the view removes the alertView', () => {
        testView.remove();

        expect(AlertView.prototype.remove).toHaveBeenCalled();
    });

    it('Expects that the SIPP endpoint is queried and the loading-indicator is shown when the pull from sipp button is clicked', () => {
        $ipNo.val('IP-123456');
        $btn.trigger('click');

        expect($loadingIndicator.is(':visible')).toBe(true);
        expect(server.requests.length).toBe(1);
        expect(server.requests[0].url).toContain('/manager/services/mppublications/sipp');
    });

    it('Expects that a successful request shows the successful alert and hides the loading indicator', () => {
        server.respondWith( [200, {'Content-Type' : 'application/json'}, '{}']);
        $btn.trigger('click');
        server.respond();

        expect(AlertView.prototype.showSuccessAlert).toHaveBeenCalled();
        expect($loadingIndicator.is(':visible')).toBe(false);
    });

    it('Expects that a failed request shows the danger alert and hides the loading indicator', () => {
        server.respondWith( [500, {'Content-Type' : 'application/json'}, '{}']);
        $btn.trigger('click');
        server.respond();

        expect(AlertView.prototype.showDangerAlert).toHaveBeenCalled();
        expect($loadingIndicator.is(':visible')).toBe(false);
    });
});