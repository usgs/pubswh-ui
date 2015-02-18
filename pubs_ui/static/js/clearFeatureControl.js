var PUBS_WH = PUBS_WH || {};

/*
 * Leaflet control used to remove a feature group from the map and to clear its layers.
 *  
 * @constructor
 * @param feature {L.FeatureGroup}
 * @param options {Object} standard L.Control options
 */ 

PUBS_WH.ClearFeatureControl = L.Control.extend({
	options: {
		position: 'topleft'
	},
	
	initialize: function(feature, options) {
		this.feature = feature;
		L.Util.setOptions(this, options);
	},
	
	onAdd: function(map) {
		var container = L.DomUtil.create('div', 'leaflet-clear-control');
		L.DomUtil.addClass(container, 'leaflet-bar');
		
		this.button = L.DomUtil.create('a', 'leaflet-clear-control-button', container);
		this.button.href="#";
		this.button.title = "Clear search area";
		this.button.innerHTML = '<span class="fa fa-trash fa-lg" style="color:black"></span>';
		L.DomEvent.addListener(this.button, 'click', this._removeFeature, this);

		return container;
	},
	
	onRemove: function(map) {
		L.DomEvent.removeListener(this.button, 'click', this._removeFeature, this);
	},
	
	_removeFeature : function(e) {
		L.DomEvent.stopPropagation(e);
		L.DomEvent.preventDefault(e);
		this._map.removeLayer(this.feature);
		this.feature.clearLayers();
	}
	
});

PUBS_WH.clearFeatureControl = function(options) {
	return new L.ClearFeatureControl(options);
};