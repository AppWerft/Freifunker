/*
 * Ti.Markermanager
 *
 * Usage:
 *
 var Car2Go = new (require('markermanager'))({
 name: 'car2go',
 points : points, [{lat:53,lng:10,title:'title',subtitle:'Subtitle'},{},{}]
 image: '/images/car2go.png',
 map  : mapView,
 maxannotations : 144
 });
 Car2Go.addEventListener('complete',function(){})
 Car2Go.destroy();
 *
 *
 * Events:
 * 'start' and 'complete'
 *
 */

var Map = require('ti.map');

var Module = function(options) {
	this.name = options.name;
	this.maxannotations = options.maxannotations || Ti.Platform.displayCaps.logicalDensityFactor * 60;
	if ( typeof options.map == 'object' && options.map.apiName && options.map.apiName == 'Ti.Proxy')
		this.map = options.map;
	this.points = options.points;
	this.image = options.image;
	this.rightImage = options.rightImage;
	this.markers_in_map = {};
	this.eventhandlers = {};
	this._importData();
	this._startMap();
	var that = this;
	var handleRegionChanged = function(_region) {
		that._updateMap(_region);
	};
	this.removeRegionChangedHandler = function() {
		this.map.removeEventListener('regionchanged', handleRegionChanged);
	};
	this.map.addEventListener('regionchanged', handleRegionChanged);
	var that = this;
	this.map.addEventListener('click', function() {
		that.map.removeEventListener('regionchanged', handleRegionChanged);
		setTimeout(function() {
			that.map.addEventListener('regionchanged', handleRegionChanged);
		}, 500);
	});

	return this;
};
Module.prototype = {
	destroy : function() {
		this.removeRegionChangedHandler();
		var annotations = [];
		for (id in this.markers_in_map) {
			if (this.markers_in_map.hasOwnProperty(id)) {
				annotations.push(this.markers_in_map[id]);
			}
		}
		this.map.removeAnnotations(annotations);
		this.markers_in_map = null;
	},
	_importData : function() {
		var t_start = new Date().getTime();
		for (var i = 0; i < this.points.length; i++)
			this.points[i].id = i;
		var t_end = new Date().getTime();
		console.log('MarkerManger: importData ' + (t_end - t_start) + ' ms.');
	},
	_startMap : function() {
		var region = this.map.getRegion();
		this._updateMap({
			latitude : region.latitude,
			longitude : region.longitude,
			latitudeDelta : region.latitudeDelta,
			longitudeDelta : region.longitudeDelta,
		});
	},
	_updateMap : function(region) {
		this.fireEvent('start');
		var t_start = new Date().getTime();
		var array_of_markers_in_range = [];
		var south = region.latitude - region.latitudeDelta / 2;
		var west = region.longitude - region.longitudeDelta / 2;
		var north = region.latitude + region.latitudeDelta / 2;
		var east = region.longitude + region.longitudeDelta / 2;
		this.points.forEach(function(p) {
			if (p.lat > south && p.lat < north && p.lng > west && p.lng < east)
				array_of_markers_in_range.push(p);
		});
		var t_end = new Date().getTime();
		console.log('MarkerManger: ' + array_of_markers_in_range.length + ' marker found in region (unfiltered)');
		if (!array_of_markers_in_range.length)
			return;
		// grouping in object_of_tiles_with_markers (RASTER in every direction => max. RASTER*RASTER on map)
		var markers = {
			to_render : {}, // this markers we will see
			to_add : [], // news ones
			to_remove : [] // obsolete ones
		};
		if (array_of_markers_in_range.length > this.maxannotations) {
			var RASTER = Math.round(Math.sqrt(this.maxannotations));
			var tilewidth = region.longitudeDelta / RASTER;
			var tileheight = region.latitudeDelta / RASTER;
			var object_of_tiles_with_markers = {};
			//
			// clustering, we take only the first in list (our strategy):
			var t_start = new Date().getTime();
			var tilecounter = 0;
			array_of_markers_in_range.forEach(function(item) {
				// calculation of key:
				var west = region.longitude - region.longitudeDelta / 2;
				var south = region.latitude - region.latitudeDelta / 2;
				var xgrid = region.longitudeDelta / RASTER;
				var ygrid = region.latitudeDelta / RASTER;
				var xkey = Math.floor((item.lng - west) / xgrid);
				var ykey = Math.floor((item.lat - south) / ygrid);
				var key = xkey + '_' + ykey;
				if (!object_of_tiles_with_markers[key]) {
					object_of_tiles_with_markers[key] = [item];
					tilecounter++;
				} else
					object_of_tiles_with_markers[key].push(item);
			});

			console.log('MarkerManger: reduced number of markers ' + tilecounter);

			// compressing:
			var compressed = 0;
			var t_start = new Date().getTime();
			for (key in object_of_tiles_with_markers) {
				if (object_of_tiles_with_markers.hasOwnProperty(key)) {
					markers.to_render[object_of_tiles_with_markers[key][0].id] = object_of_tiles_with_markers[key][0];
				}
			}
		} else {
			array_of_markers_in_range.forEach(function(item) {
				markers.to_render[item.id] = item;
			});
		}
		/*
		 * map api uses arrays for adding removing
		 * for persisting we use objects. This accelerate the access
		 */
		/* obsolete ones */
		for (id in this.markers_in_map) {
			if (this.markers_in_map.hasOwnProperty(id)) {
				if (markers.to_render[id] == undefined) {
					markers.to_remove.push(this.markers_in_map[id]);
					delete this.markers_in_map[id];
				}
			}
		}
		/* new ones: */
		for (id in markers.to_render) {
			if (markers.to_render.hasOwnProperty(id)) {
				if (this.markers_in_map && !this.markers_in_map[id]) {
					var annotation = Map.createAnnotation({
						latitude : markers.to_render[id].lat,
						longitude : markers.to_render[id].lng,
						title : markers.to_render[id].title,
						subtitle : markers.to_render[id].subtitle,
						image : (markers.to_render[id].image) ? markers.to_render[id].image : this.image,
						rightView : this.rightImage ? Ti.UI.createImageView({
							image : this.rightImage,
							width : 36,
							height : 36
						}) : null,
						name : this.name
					});
					markers.to_add.push(annotation);
					this.markers_in_map[id] = annotation;
				}
			}
		};
		var t_end = new Date().getTime();
		this.map.removeAnnotations(markers.to_remove);
		this.map.addAnnotations(markers.to_add);
		var t_end = new Date().getTime();
		console.log('MarkerManger: rendering time ' + (t_end - t_start) + ' ms.');
		this.fireEvent('complete');
	},
	fireEvent : function(_event, _payload) {
		if (this.eventhandlers[_event]) {
			for (var i = 0; i < this.eventhandlers[_event].length; i++) {
				this.eventhandlers[_event][i].call(this, _payload);
			}
		}
	},
	addEventListener : function(_event, _callback) {
		if (!this.eventhandlers[_event])
			this.eventhandlers[_event] = [];
		this.eventhandlers[_event].push(_callback);
	},
	removeEventListener : function(_event, _callback) {
		if (!this.eventhandlers[_event])
			return;
		var newArray = this.eventhandlers[_event].filter(function(element) {
			return element != _callback;
		});
		this.eventhandlers[_event] = newArray;
	}
};

module.exports = Module;
