var Moment = require('vendor/moment');
Moment.locale('de');
var Map = require('ti.map');
var Freifunk = new (require('adapter/freifunk'))();
var DomainList = new (require('adapter/domainlist'))();
var MarkerManager = require('vendor/markermanager');

var MarkerManagerFreifunk;
var DomainPolygon;
var ActionBar = require('com.alcoapps.actionbarextras');
domainlist = DomainList.getList();

module.exports = function() {
	function renderNodes(_args) {
		self.progress.setRefreshing(false);
		self.spinner.hide();
		if (!self.mapView)
			return;
		if (_args != null) {
			var points = _args.nodes.map(function(node) {
				var subtitles = [];
				if (node.clients !== undefined)
					subtitles.push('Clients: ' + node.clients + '             ');
				if (node.online !== undefined)
					subtitles.push('online: ' + node.online + '             ');
				return {
					lat : node.lat,
					lng : node.lon,
					id : node.id,
					title : node.name,
					reldist : node.reldist,
					image : (node.online == true || node.online == undefined) ? '/images/freifunk.png' : '/images/freifunk_.png',
					subtitle : (subtitles.length) ? subtitles.join('\n') : undefined
				};
			});
			self.mapView.setRegion(_args.region);
			self.mapView.regionset = true;
			setTimeout(function() {
				self.mapView.regionset = false;
			}, 1000);
			Ti.UI.createNotification({
				message : String.format(L('PARAT'), points.length)
			}).show();
			ActionBar.setSubtitle(points.length + ' Router ' + _args.nodestotal.online + '/' + _args.nodestotal.offline);
			MarkerManagerFreifunk && MarkerManagerFreifunk.destroy();
			var convexHull = new (require('vendor/ConvexHullGrahamScan'))();
			points.forEach(function(p) {
				if (p.reldist < 3)// only points in 'cloud'
					convexHull.addPoint(p.lng, p.lat);
			});
			var hullpoints = convexHull.getHull().map(function(e) {
				return {
					latitude : e.y,
					longitude : e.x
				};
			});
			if (DomainPolygon) {
				self.mapView.removePolygon(DomainPolygon);
				DomainPolygon = null;
			}
			DomainPolygon = Map.createPolygon({
				points : hullpoints,
				strokeColor : '#DE2C68',
				fillColor : '#22DE2C68',
				strokeWidth : Ti.Platform.displayCaps.logicalDensityFactor * 2 || 2,
			});
			MarkerManagerFreifunk = new MarkerManager({
				name : 'freifunk',
				map : self.mapView,
				image : '/images/freifunk.png',
				points : points,
				rightImage : '/images/pfeil.png'
			});
			self.mapView.addPolygon(DomainPolygon);
		} else {
			Ti.UI.createNotification({
				message : "Verbindung zum Server gestört."
			}).show();
		}
	};
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
		console.log('Info: last region restored to ' + lastregion.latitude + ',' + lastregion.longitude);
	}
	var event = arguments[0] || {};
	var self = Ti.UI.createWindow({
		fullscreen : false,
		flagSecure : false,
		
		spinner : Ti.UI.createActivityIndicator({
			height : Ti.UI.SIZE,
			width : Ti.UI.SIZE,
			visible : true,
			zIndex : 999,
			style : (Ti.Platform.name === 'iPhone OS') ? Ti.UI.iPhone.ActivityIndicatorStyle.BIG : Ti.UI.ActivityIndicatorStyle.BIG
		})
	});
	var mapavailable = require('vendor/gms.test')();
	if (mapavailable === true) {
		console.log('GMS test OK');
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
	} else {
		console.log('GMS failed');
		console.log(mapavailable);
	}
	var view = Ti.UI.createView({
		top : 74,
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

	self.mapView && self.mapView.addEventListener('regionchanged', onRegionChanged);
	self.mapView && self.mapView.addEventListener('click', onPinclick);

	var picker = Ti.UI.createPicker({
		top : 80,
		width : 170,
		height : 45,
		zIndex : 9999,
		selectionIndicator : true,
		left : 0,
	});
	var mydomain = 0;
	picker.add(domainlist.map(function(domain, ndx) {
		try {
			if (Ti.App.Properties.getString('LASTCITY', '') == domain.name)
				mydomain = ndx;
			return Ti.UI.createPickerRow({
				title : domain.name,
				url : domain.url,
				ndx : ndx
			});
		} catch(E) {
		}
	}));
	picker.addEventListener('change', function(_e) {
		self.progress.setRefreshing(true);
		Ti.App.Properties.setString('LASTCITY', _e.row.title);
		Ti.App.Properties.setString('LASTCITYURL', _e.row.url);
		console.log(_e.row);
		Freifunk.loadNodes({
			url : _e.row.url,
			name : _e.row.title,
			done : renderNodes
		});

	});
	self.mapView && self.mapView.addEventListener('complete', function() {
		self.mapView.add(Ti.UI.createView({
			top : 80,
			backgroundColor : '#afff',
			width : 168,
			height : 40,
			zIndex : 888,
			left : 0,
		}));
		self.mapView.add(picker);
		picker.setSelectedRow(0, mydomain);
	});
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

		if (_e.source.regionset == true)
			return false;
		Ti.App.Properties.setString('LASTREGION', JSON.stringify({
			latitude : _e.latitude,
			longitude : _e.longitude,
			latitudeDelta : _e.latitudeDelta,
			longitudeDelta : _e.longitudeDelta
		}));
		console.log('Info: saving lastregion of map to ' + _e.latitude + ',' + _e.longitude);
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
	};
	self.reloadDomain = function() {
		self.progress.setRefreshing(true);
		ActionBar.setSubtitle('⇊ ⇊ ⇊ ⇊ ⇊');
		Freifunk.loadNodes({
			url : Ti.App.Properties.getString('LASTCITYURL', 'Hamburg'),
			name : Ti.App.Properties.getString('LASTCITY', 'Hamburg'),
			done : renderNodes
		});
	};
	self.reloadDomain();
	return self;
};
