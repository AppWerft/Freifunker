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
	if (require('vendor/gms.test')()) {
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
	}
	var view = Ti.UI.createView({
		top : 64,
		height : 20
	});
	self.mapView && self.add(self.mapView);
	if (Ti.Android) {
		self.progress = require('com.rkam.swiperefreshlayout').createSwipeRefresh({
			view : view,
			height : 20,
			top : 74,
			width : Ti.UI.FILL
		});
		self.add(self.progress);
	}
	self.mapView && self.mapView.addEventListener('complete', function() {
		// event pins
	});
	self.mapView && self.mapView.addEventListener('regionchanged', onRegionChanged);
	self.mapView && self.mapView.addEventListener('click', onPinclick);
	function onPinclick(_e) {
		self.mapView.removeEventListener('click', onPinclick);
		setTimeout(function() {
			self.mapView.addEventListener('click', onPinclick);
		}, 700);
		if (_e.clicksource != null && _e.annotation && _e.annotation.name && _e.clicksource != 'pin') {
			require('ui/routing.window')({
				title : _e.annotation.title,
				lat : _e.annotation.latitude,
				lon : _e.annotation.longitude,

			}).open();
		}
		self.locked = true;
		setTimeout(function() {
			self.locked = false;
			var region = self.mapView.getRegion();
		}, 900);
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
