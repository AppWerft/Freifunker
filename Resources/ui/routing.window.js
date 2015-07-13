var Moment = require('vendor/moment');
Moment.locale('de');
var routes = [];
var Map = require('ti.map');

module.exports = function(args) {

	var self = Ti.UI.createWindow({
		fullscreen : false,
		title : args.title,
		orientationModes : []
	});
	var GeoRoute = new (require('vendor/georoute'))();
	GeoRoute.addEventListener('position', function(_e) {
		GeoRoute.getRoute(_e.coords, args.lat + ',' + args.lon);
	});
	GeoRoute.getLocation();
	var mapworks = require('vendor/gms.test')();
	if (mapworks) {
		var map = require('ti.map').createView({
			region : {
				latitude : args.lat,
				longitude : args.lon,
				latitudeDelta : 0.01,
				longitudeDelta : 0.01
			},
			animated : true,
			traffic : false,
			enableZoomControls : false,
			userLocation : false,
			mapType : require('ti.map').NORMAL_TYPE,
			height : '50%',
			top : 0
		});
		self.add(map);
		GeoRoute.addEventListener('route', function(_e) {
			var leg = _e.route.legs[0];
			var bounds = _e.route.bounds;
			var region = {
				latitude : (Math.max(bounds.southwest.lat, bounds.northeast.lat) + Math.min(bounds.southwest.lat, bounds.northeast.lat)) / 2,
				longitude : (Math.max(bounds.southwest.lng, bounds.northeast.lng) + Math.min(bounds.southwest.lng, bounds.northeast.lng)) / 2,
				latitudeDelta : (Math.max(bounds.southwest.lat, bounds.northeast.lat) - Math.min(bounds.southwest.lat, bounds.northeast.lat)) * 1.6,
				longitudeDelta : (Math.max(bounds.southwest.lng, bounds.northeast.lng) - Math.min(bounds.southwest.lng, bounds.northeast.lng)) * 1.6
			};
			map.setRegion(region);
			//remove old rotes from map:
			//while ( route = routes.pop()) {
			//	map.removeRoute(route);
			//};
			// add new ones:
			routes = [require('ti.map').createRoute({
				points : require('vendor/decodePolyline')(_e.route.overview_polyline.points),
				width : 8 * Ti.Platform.displayCaps.logicalDensityFactor,
				opacity : 0.6,
				color : '#DA1068'
			}), require('ti.map').createRoute({
				points : require('vendor/decodePolyline')(_e.route.overview_polyline.points),
				width : 1 * Ti.Platform.displayCaps.logicalDensityFactor,
				opacity : 1,
				color : '#000'
			})];
			routes.forEach(function(route) {
				map.addRoute(route);
			});
			map.addAnnotation(require('ti.map').createAnnotation({
				
				latitude : leg.start_location.lat,
				longitude : leg.start_location.lng,
			}));
			map.addAnnotation(require('ti.map').createAnnotation({
				latitude : leg.end_location.lat,
				longitude : leg.end_location.lng,
			}));
		});
	}
	var router = Ti.UI.createTableView({
		bottom : 0,
		height : mapworks ? '50%' : Ti.UI.FILL
	});
	self.add(router);
	GeoRoute.addEventListener('route', function(_e) {
		var leg = _e.route.legs[0];
		var data = [];
		var startrow = Ti.UI.createTableViewRow();
		startrow.add(Ti.UI.createLabel({
			html : leg.start_address,
			text : (Ti.Android) ? '' : leg.start_address,
			left : 10,
			top : 5,
			bottom : 5,
			color : '#DA1068',
			width : Ti.UI.FILL,
			textAlign : 'left',
			font : {
				fontFamily : 'Roboto Condensed',
				fontSize : 22
			},
			height : Ti.UI.SIZE
		}));
		data[0] = startrow;
		leg.steps.forEach(function(step) {
			var row = Ti.UI.createTableViewRow();
			row.add(Ti.UI.createLabel({
				html : step.html_instructions,
				text : (Ti.Android) ? '' : leg.html_instructions.replace(/<.*?>/g, ''),
				left : 90,
				top : 5,
				bottom : 5,
				height : Ti.UI.SIZE,
				width : Ti.UI.FILL,
				textAlign : 'left',
				font : {
					fontFamily : 'DroidSans',
					fontSize : 16
				}
			}));
			row.add(Ti.UI.createLabel({
				text : step.distance.text,
				left : 5,
				top : 0,
				color : '#DA1068',
				width : Ti.UI.FILL,
				textAlign : 'left',
				font : {
					fontFamily : 'Roboto Condensed',
					fontSize : 22,
					fontWeight : 'bold'
				}
			}));
			data.push(row);

		});
		var endrow = Ti.UI.createTableViewRow();
		endrow.add(Ti.UI.createLabel({
			html : leg.end_address,
			left : 10,
			top : 5,
			bottom : 5,
			color : '#DA1068',
			width : Ti.UI.FILL,
			textAlign : 'left',
			font : {
				fontFamily : 'Roboto Condensed',
				fontSize : 22
			}
		}));
		data.push(endrow);
		router.setData(data);
	});

	self.addEventListener('open', require('ui/routing.actionbar'));
	return self;
};
