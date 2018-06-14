define([
    'jquery',
    'models/PublicationModel',
    'views/GeospatialView'
], function($, PublicationModel, GeospatialView) {
    describe('GeospatialView', function() {

        var testView, testModel;

        beforeEach(function() {
            $('body').append('<div id="test-div"></div>');

            testModel = new PublicationModel();
            testView = new GeospatialView({
                el : '#test-div',
                model : testModel
            });
            testView.render();
        });

        afterEach(function() {
            testView.remove();
            $('#test-div').remove();
        });

        it('Expects that changes to the DOM inputs are reflected in the model', function() {
            testView.$('#country-input').val('Country').trigger('change');
            expect(testModel.get('country')).toEqual('Country');
            testView.$('#state-input').val('State').trigger('change');
            expect(testModel.get('state')).toEqual('State');
            testView.$('#county-input').val('County').trigger('change');
            expect(testModel.get('county')).toEqual('County');
            testView.$('#city-input').val('City').trigger('change');
            expect(testModel.get('city')).toEqual('City');
            testView.$('#otherGeospatial-input').val('Other Geospatial').trigger('change');
            expect(testModel.get('otherGeospatial')).toEqual('Other Geospatial');
            testView.$('#geographicExtents-input').val('Geo Extents').trigger('change');
            expect(testModel.get('geographicExtents')).toEqual('Geo Extents');
        });

        it('Expects that changes to the model properties are reflected in the DOM inputs', function() {
            testModel.set('country', 'Country');
            expect(testView.$('#country-input').val()).toEqual('Country');
            testModel.set('state', 'State');
            expect(testView.$('#state-input').val()).toEqual('State');
            testModel.set('county', 'County');
            expect(testView.$('#county-input').val()).toEqual('County');
            testModel.set('city', 'City');
            expect(testView.$('#city-input').val()).toEqual('City');
            testModel.set('otherGeospatial', 'Other Geospatial');
            expect(testView.$('#otherGeospatial-input').val()).toEqual('Other Geospatial');
            testModel.set('geographicExtents', 'Geo Extents');
            expect(testView.$('#geographicExtents-input').val()).toEqual('Geo Extents');
        });
    });
});
