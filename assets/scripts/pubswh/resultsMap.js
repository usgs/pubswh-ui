var PUBS_WH = window.PUBS_WH = window.PUBS_WH || {};

/*
 * @param {Object} options
 * 		@prop {String} mapDivId
 * 		@prop {Array of Object} publications
 * 		@prop {Boolean} enablePopup - publication extent layers should be interactive only when set to true
 * @returns {L.Map} - Returns the map object created.
 */
PUBS_WH.createResultsMap = function(options) {
		/*var EMPTY_PUBS_EXTENTS = {
		type: 'FeatureCollection',
		features: [],
		properties: {title: 'All pubs extents'}
	};*/

	var POPUP_HTML =
		'{{#each layers}}' +
			'<p><span class="search-title"><a href="{{url}}">{{{title}}}</a></span></br>' +
			'<span class="pubinfo">{{info}}</span></br>' +
			'<button class="filter-button" data-layer-index="{{layerIndex}}">Highlight</button>' +
			'</p>' +
		'{{/each}}';
	var popupTemplate = Handlebars.compile(POPUP_HTML);

	// This is the default style of extent layers when the user isn't interacting
	// with the map
	var quiet = {
		stroke: false,
		fillColor: '#222',
		fillOpacity: 0.2,
		opacity: 0.4,
		weight: 1
	};

	// The style of a extent layer that has been selected.
	var loud = {
		stroke: true,
		fillColor: '#222',
		fillOpacity: 0.2,
		opacity: 0.4,
		color: 'red',
		weight: 2
	};

	var pubsExtentLayers = _.chain(options.publications)
		.filter(function(pub) {
			return _.has(pub, 'geographicExtents');
		})
		.map(function(pub) {
			return L.geoJSON(pub.geographicExtents, {
				style: quiet,
				interactive: options.enablePopup
			});
		})
		.value();

	var baseMaps = {
		'Oceans': L.esri.basemapLayer('Oceans', {detectRetina: true}),
		'Topographic': L.esri.basemapLayer('Topographic'),
		'Streets': L.esri.basemapLayer('Streets')
	};

	var overlayMaps = {
		'Ocean Labels': L.esri.basemapLayer('OceansLabels')
	};

	var map = L.map(options.mapDivId, {
		layers: baseMaps.Topographic,
		zoom: 4,
		center: [38, -115]
	});

	var resetStyles = function() {
		pubsExtentLayers.forEach(function(layer) {
			layer.setStyle(quiet);
		});
	};

	var highlightMatch = function() {
		var layerIndex = $(this).data('layer-index');
		pubsExtentLayers.forEach(function(layer, index) {
			if (index === layerIndex) {
				layer.setStyle(loud);
			} else {
				layer.setStyle(quiet);
			}
		});
	};

	var showExtentInfoPopup = function(evt) {
		var clickedLayerProps = {layers: []};

		pubsExtentLayers.forEach(function(layer, index) {
			var matchAtPoint = leafletPip.pointInLayer(evt.latlng, layer);
			if (matchAtPoint.length) {
				var layerData = matchAtPoint[0].feature.properties;
				layerData.layerIndex = index;
				clickedLayerProps.layers.push(layerData);
			}

		});
		if (clickedLayerProps.layers.length) {
			map.openPopup(popupTemplate(clickedLayerProps), evt.latlng, {
				maxWidth: 350,
				minWidth: 150,
				maxHeight: 300,
				offset: [0, -3],
				autoPan: true,
				closeButton: true,
				autoPanPadding: [5, 5]
			});
			$('.filter-button').click(highlightMatch);
		}
	};

	map.addControl(L.control.layers(baseMaps, overlayMaps));
	map.on('popupclose', resetStyles);

	pubsExtentLayers.forEach(function (layer) {
		map.addLayer(layer);
		layer.on('click', showExtentInfoPopup);
	});

	if (pubsExtentLayers.length) {
		map.fitBounds(L.featureGroup(pubsExtentLayers).getBounds());
	}

	return map;
};
