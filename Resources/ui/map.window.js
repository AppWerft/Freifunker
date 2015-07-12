var Moment = require('vendor/moment');
Moment.locale('de');

var Map = require('ti.map');

module.exports = function() {
	var region = {
		latitude : 53.56,
		longitude : 10,
		latitudeDelta : 0.1,
		longitudeDelta : 0.1,
		limit : 50
	};
	if (Ti.App.Properties.hasProperty('LASTREGION')) {
		var lastregion = JSON.parse(Ti.App.Properties.getString('LASTREGION'));
		region = {
			latitude : lastregion.latitude,
			longitude : lastregion.longitude,
			latitudeDelta : lastregion.latitudeDelta,
			longitudeDelta : lastregion.longitudeDelta,
			limit : 50
		};
	}
	var event = arguments[0] || {};

	var self = Ti.UI.createWindow({
		fullscreen : false,
		orientationModes : []
	});
	self.mapView = Map.createView({
		region : region,
		top : 0,
		animate : true,
		compassEnabled : false,
		userLocation : true,
		enableZoomControls : false,
		userLocationButton : false,
		mapType : Map.NORMAL_TYPE,
	});
	var view = Ti.UI.createView({
		top : 64,
		height : 20
	});
	self.add(self.mapView);
	/*
	 require('adapter/ffmap')({
	 done : function(_res) {
	 Object.getOwnPropertyNames(_res.areas).map(function(a) {
	 console.log(a + '  ' + _res.areas[a].hullpoints.length);
	 if (_res.areas[a].hullpoints.length < 7)
	 self.mapView.addPolygon(Map.createPolygon({
	 points : _res.areas[a].hullpoints,
	 strokeColor : '333',
	 strokeOpacity : 0.6,
	 fillColor : '#11DE2C68',
	 strokeWidth : Ti.Platform.displayCaps.logicalDensityFactor || 1,
	 //	fillColor : 'transparent'
	 }));
	 });
	 }
	 });*/
	if (Ti.Android) {
		self.progress = require('com.rkam.swiperefreshlayout').createSwipeRefresh({
			view : view,
			height : 20,
			top : 74,
			width : Ti.UI.FILL
		});
		self.add(self.progress);
	}

	self.mapView.addEventListener('complete', function() {
		// event pins

	});
	// Ti.Android && self.addEventListener('open', require('ui/map.actionbar'));
	self.mapView.addEventListener('regionchanged', onRegionChanged);
	self.mapView.addEventListener('click', onPinclick);
	function onPinclick(_e) {
		self.mapView.removeEventListener('click', onPinclick);
		setTimeout(function() {
			self.mapView.addEventListener('click', onPinclick);
		}, 700);
		if (_e.clicksource != null && _e.annotation && _e.annotation.name && _e.clicksource != 'pin') {
		}
		self.locked = true;
		// self.mapView.removeEventListener('regionchanged', onRegionChanged);
		setTimeout(function() {
			self.locked = false;
			var region = self.mapView.getRegion();
			//     self.mapView.fireEvent('regionchanged', region);
		}, 700);

	}

	function onRegionChanged(_e) {
		function isIdinList(id) {
			return false;
		}


		Ti.App.Properties.setString('LASTREGION', JSON.stringify({
			latitude : _e.latitude,
			longitude : _e.longitude,
			latitudeDelta : _e.latitudeDelta,
			longitudeDelta : _e.longitudeDelta
		}));
		if (self.locked == false) {
			self.locked = true;
			setTimeout(function() {
				self.locked = false;
			}, 50);
		} else {
			setTimeout(function() {
				self.locked = false;
			}, 50);
		}
	}
	
	return self;
};
