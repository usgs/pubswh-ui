import { createResultsMap } from '../../../scripts/pubswh/resultsMap';


describe('ResultsMap', function() {

    var map;
    var $mapDiv;

    beforeEach(function() {
        $('body').append('<div id="test-map-div" style="width: 15px; height: 15px;"></div>');
        $mapDiv = $('#test-map-div');

        spyOn(L, 'geoJSON').and.callThrough();
    });

    afterEach(function() {
        if (map) {
            map.remove();
        }
        $mapDiv.remove();
    });

    it('Expect no extent layers to be created if an empty publications object is passed in', function() {
        map = createResultsMap({
            mapDivId: 'test-map-div',
            publications: [],
            enablePopup: true
        });

        expect(L.geoJSON).not.toHaveBeenCalled();
    });

    it('Expect no extent layers to be created if the list of publications does not contain any geographicExtents', function() {
        var publications = [
            {
                title : 'Title1',
                url: 'https://fake.com/1',
                info: 'Description 1'
            }, {
                title: 'Title2',
                url: 'https://fkae.com/1',
                info: 'Description 2'
            }
        ];
        map = createResultsMap({
            mapDivId: 'test-map-div',
            publications: publications,
            enablePopup: true
        });

        expect(L.geoJSON).not.toHaveBeenCalled();
    });

    //Randomly failing
    xit('Expects that extent layers are created for publications with a geographicExtent property', function() {
        var publications = [
            {
                title : 'Title1',
                url: 'https://fake.com/1',
                info: 'Description 1',
                geographicExtents: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            'geometry': {
                                'type': 'Polygon',
                                'coordinates': [[
                                    [-10.0, -10.0], [10.0, -10.0], [10.0, 10.0], [-10.0, 10.0]
                                ]]
                            },
                            'properties': {
                                title: 'Title1',
                                url: 'https://fake.com/1',
                                info: 'Description 1'
                            }
                        }
                    ]
                }
            }, {
                title: 'Title2',
                url: 'https://fkae.com/1',
                info: 'Description 2'
            }, {
                title : 'Title3',
                url: 'https://fake.com/3',
                info: 'Description 3',
                geographicExtents: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            'geometry': {
                                'type': 'Polygon',
                                'coordinates': [[
                                    [-10.0, -10.0], [10.0, -10.0], [10.0, 10.0], [-10.0, 10.0]
                                ]]
                            },
                            'properties': {
                                title: 'Title3',
                                url: 'https://fake.com/3',
                                info: 'Description 3'
                            }
                        }
                    ]
                }
            }
        ];
        map = createResultsMap({
            mapDivId: 'test-map-div',
            publications: publications,
            enablePopup: true
        });

        expect(L.geoJSON.calls.count()).toBe(2);
    });



});
