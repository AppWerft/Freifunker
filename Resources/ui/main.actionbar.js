var ActionBar = require('com.alcoapps.actionbarextras');
var Map = require('ti.map');
var Moment = require('vendor/moment');
Moment.locale('de');
var MarkerManager = require('vendor/markermanager');
var Freifunk = new (require('adapter/freifunk'))();
var MarkerManagerFreifunk;
var DomainPolygon;
//var Geo = new (require('vendor/georoute'))();
//Geo.getLocation();

if (!String.prototype.rtrim) {! function() {
		String.prototype.rtrim = function() {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		};
	}();
}
var domains = require('model/domains').sort(function(a, b) {
	return a.name > b.name ? 1 : -1;
});

module.exports = function(_event) {
	function renderNodes(_args) {
		_event.source.progress.setRefreshing(false);
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
				subtitle : (subtitles.length) ? subtitles.join('\n') : undefined
			};
		});
		_event.source.mapView.setRegion(_args.region);
		Ti.UI.createNotification({
			message : 'Derweil sind ' + points.length + ' Router mit Standortangabe parat'
		}).show();
		MarkerManagerFreifunk && MarkerManagerFreifunk.destroy();

		var convexHull = new (require('vendor/ConvexHullGrahamScan'))();
		points.forEach(function(p) {
			if (p.lat > 45 && p.lat < 60 && p.lng > 3 && p.lng < 25)
				convexHull.addPoint(p.lng, p.lat);
		});
		var hullpoints = convexHull.getHull().map(function(e) {
			return {
				latitude : e.y,
				longitude : e.x
			};
		});
		if (DomainPolygon) {
			_event.source.mapView.removePolygon(DomainPolygon);
			DomainPolygon = null;
		}
		DomainPolygon = Map.createPolygon({
			points : hullpoints,
			strokeColor : '#DE2C68',
			fillColor : '#33DE2C68',
			strokeWidth : Ti.Platform.displayCaps.logicalDensityFactor * 2 || 2,
		});
		MarkerManagerFreifunk = new MarkerManager({
			name : 'freifunk',
			map : _event.source.mapView,
			image : '/images/freifunk.png',
			points : points
		});
		_event.source.mapView.addPolygon(DomainPolygon);
	};
	var lastcity = Ti.App.Properties.getString('LASTCITY', 'Hamburg');
	var lastcityid = Ti.App.Properties.getInt('LASTCITYID', 1);
	ActionBar.setTitle('Freifunk');
	ActionBar.setFont('Roboto Condensed');
	ActionBar.setSubtitle(lastcity);
	ActionBar.subtitleColor = "#444";
	ActionBar.setBackgroundColor('#F9EABA');
	_event.source.progress.setRefreshing(true);
	Freifunk.loadNodes({
		url : domains[lastcityid].url,
		done : renderNodes
	});

	var activity = _event.source.getActivity();
	if (!activity)
		return;
	activity.onCreateOptionsMenu = function(_menuevent) {
		_menuevent.menu.clear();
		_menuevent.menu.add({
			title : 'GITHUB',
			itemId : 998,
			groupId : 1,
			icon : Ti.App.Android.R.drawable.ic_action_github,
			showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
		}).addEventListener("click", require('ui/github.window'));
		_menuevent.menu.add({
			title : 'RSS',
			itemId : 999,
			groupId : 0,
			icon : Ti.App.Android.R.drawable.ic_action_rss,
			showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
		}).addEventListener("click", function() {
			require('ui/rss.window')().open();
		});
		domains.forEach(function(city, i) {
			_menuevent.menu.add({
				title : city.name,
				itemId : i,
				checkable : true,
				checked : lastcity == city.name ? true : false,
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			}).addEventListener("click", function() {
				_menuevent.menu.findItem(i).checked = true;
				_menuevent.menu.findItem(lastcityid).checked = false;
				lastcityid = i;
				Ti.App.Properties.setInt('LASTCITYID', i);
				Ti.App.Properties.setString('LASTCITY', _menuevent.menu.findItem(i).title);
				ActionBar.setSubtitle(_menuevent.menu.findItem(i).title);
				_event.source.progress.setRefreshing(true);
				Freifunk.loadNodes({
					url : domains[i].url,
					done : renderNodes
				});
			});
		});
		activity.actionBar.displayHomeAsUp = false;
	};
	activity && activity.invalidateOptionsMenu();
	activity.actionBar.onHomeIconItemSelected = function(_e) {

	};

};
