(function() {

	$(document).ready(function() {
         //add esri basemap layers
        var topo = L.esri.basemapLayer('Topographic');
        var oceans = L.esri.basemapLayer('Oceans',{ detectRetina: true});
        var streets = L.esri.basemapLayer('Streets');

        var oceanlabels =  L.esri.basemapLayer('OceansLabels')

        // create a map

        map = L.map('search-map-div', {});
        
        var baseMaps = {
            "Oceans": oceans,
            "Topographic": topo,
            "Streets": streets

        };

        var overlayMaps = {
            "Ocean Labels": oceanlabels
        };
        
        var searchFeature = new L.FeatureGroup();

        L.control.layers(baseMaps, overlayMaps).addTo(map);
        
        var drawControl = new L.Control.Draw({
        	draw : {
        		polyline : false,
        		circle : false,
        		marker : false
        	},
        	edit : {
        		featureGroup : searchFeature,
        		edit : false,
        		remove : {}
        	}
        });
        map.addControl(drawControl);
        
        map.on('draw:created', function(e) {
        	searchFeature.addLayer(e.layer);
        	map.addLayer(searchFeature);
        });
        
        map.on('draw:drawstart', function(e) {
        	if (searchFeature.getLayers().length !== 0) {
        		map.removeLayer(searchFeature);
              	searchFeature.clearLayers();
        	}
        });
        
        map.setView([38.75,-100.45], 4);
        L.esri.basemapLayer('Topographic').addTo(map);

	});
	
}());