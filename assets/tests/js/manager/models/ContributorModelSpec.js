import ContributorModel from '../../../../scripts/manager/models/ContributorModel';


describe('ContributorModel', function() {
    var server;

    beforeEach(function() {
        server = sinon.fakeServer.create();
    });

    afterEach(function() {
        server.restore();
    });

    it('Expects that the url for fetch will contain /contributor/{contributorId}', function() {
        var model = new ContributorModel({contributorId : 1234});
        model.fetch();

        expect(server.requests[0].url).toContain('contributor/1234');
    });

    it('Expects that the url for save for a new contributor that is a corporation contains /corporation', function() {
        var model = new ContributorModel({corporation : true});
        model.save();

        expect(server.requests[0].url).toContain('corporation');
    });

    it('Expects that the url for save for a new contributor that is a USGS contributor contains /usgscontributor', function() {
        var model = new ContributorModel({corporation : false, usgs : true});
        model.save();

        expect(server.requests[0].url).toContain('usgscontributor');
    });

    it('Expects that the url for save for a new contributor that is a not a USGS contributor contains /outsidecontributor', function() {
        var model = new ContributorModel({corporation : false, usgs : false});
        model.save();

        expect(server.requests[0].url).toContain('outsidecontributor');
    });

    it('Expects that the url for save for an existing contributor that is a corporation contains /corporation/{contributorId', function() {
        var model = new ContributorModel({contributorId : 1234, corporation : true});
        model.save();

        expect(server.requests[0].url).toContain('corporation/1234');
    });

    it('Expects that the url for save for an existing contributor that is a USGS contributor contains /usgscontributor/{contributorId}', function() {
        var model = new ContributorModel({contributorId : 1234, corporation : false, usgs : true});
        model.save();

        expect(server.requests[0].url).toContain('usgscontributor/1234');
    });

    it('Expects that the url for save for an existing contributor that is a not a USGS contributor contains /outsidecontributor/{contributorId}', function() {
        var model = new ContributorModel({contributorId : 1234, corporation : false, usgs : false});
        model.save();

        expect(server.requests[0].url).toContain('outsidecontributor/1234');
    });

    it('Expects that on a save operation, the validationErrors property is not set to the server', function() {
        var model= new ContributorModel({contributorId : 1234, corporation : true, validationErrors : ['One error']});
        model.save();

        expect(server.requests[0].requestBody).toEqual(JSON.stringify({contributorId : 1234, corporation : true}));
    });
});
