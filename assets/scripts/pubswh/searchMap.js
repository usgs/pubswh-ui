import { ClearFeatureControl } from './clearFeatureControl';


var PUBS_WH = window.PUBS_WH = window.PUBS_WH || {};
/*
 * Creates a Leaflet map and controls to draw a search box and to update an input element
 * when a box has been drawn or cleared.
 *
 * @param mapDivId {String} id of the div where the search map will be created
 * @param $geomInput {Jquery element} - input element whose value will be updated when
 *        a polygon is drawn on the map.
 * @return a Leaflet map object
 */
PUBS_WH.createSearchMap = function(mapDivId, $geomInput) {
        var SHAPE_OPTIONS = {
            color: '#ff0000',
            fill : true
    };

    var baseLayers = {
        'Topographic' : L.esri.basemapLayer('Topographic'),
        'Streets' : L.esri.basemapLayer('Streets'),
        'Oceans' : L.esri.basemapLayer('Oceans')
    };

    var overlayLayers = {
        'Ocean Labels' : L.esri.basemapLayer('OceansLabels')
    };

    var searchFeature = new L.FeatureGroup();

    var map = L.map(mapDivId, {
        layers : [baseLayers.Topographic]
    });

    // If $geomInput has a value, then add that feature to the feature group.
    var initialGeomVal = $geomInput.val();
    var wkt;
    if (initialGeomVal) {
        wkt = new Wkt.Wkt();
        wkt.read(initialGeomVal);

        searchFeature.addLayer(wkt.toObject(SHAPE_OPTIONS));
        map.addLayer(searchFeature);
    }

    // Add event handlers on the searchFeature layer to update $geomInput
    searchFeature.on('layeradd', function(e) {
        var wkt = new Wkt.Wkt();
        wkt.fromObject(e.layer);
        $geomInput.val(wkt.write());
    });

    searchFeature.on('layerremove', function() {
        $geomInput.val('');
    });

    // Create controls
    var drawControl = new L.Control.Draw({
        draw : {
            polyline : false,
            circle : false,
            marker : false,
            polygon : {
                shapeOptions: SHAPE_OPTIONS
            },
            rectangle : {
                shapeOptions: SHAPE_OPTIONS
            }
        },
        edit : {
            featureGroup : searchFeature,
            edit : false,
            remove : false
        }
    });

    var deleteFeatureControl = new ClearFeatureControl(searchFeature, {});

    // Add controls
    L.control.layers(baseLayers, overlayLayers).addTo(map);
    drawControl.addTo(map);
    deleteFeatureControl.addTo(map);

    // Handle draw control events
    map.on('draw:created', function(e) {
        searchFeature.addLayer(e.layer);
        map.addLayer(searchFeature);
    });
    map.on('draw:drawstart', function() {
        if (searchFeature.getLayers().length !== 0) {
            map.removeLayer(searchFeature);
            searchFeature.clearLayers();
        }
    });

    // Finish initializing the map
    L.esri.basemapLayer('Topographic').addTo(map);
    map.setView([ 38.75, -100.45 ], 4);

    return map;
};
