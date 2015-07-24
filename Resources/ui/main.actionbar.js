var Map = require('ti.map');
var Moment = require('vendor/moment');
Moment.locale('de');
var MarkerManager = require('vendor/markermanager');
var Freifunk = new (require('adapter/freifunk'))();
var MarkerManagerFreifunk;
var DomainPolygon;
var DomainList = new (require('adapter/domainlist'))();
var domainlist = DomainList.getList();
var ActionBar = require('com.alcoapps.actionbarextras');
DomainList.addEventListener('load', function(_res) {
	domainlist = _res.domainlist;
});
DomainList.loadList();

var url = 'https://raw.githubusercontent.com/AppWerft/Freifunker/master/Resources/model/domainlist.json';
if (!Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'domainlist.json').exists()) {
	Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'domainlist.json').write(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'model', 'domainlist.json').read());
}
var domainlist = JSON.parse(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'domainlist.json').read().getText());

var lastcity = Ti.App.Properties.getString('LASTCITY', 'Hamburg');
console.log('Info: lastcity = ' + lastcity);
var hamburgidid;
domainlist.forEach(function(d, i) {
	if (d.name == 'Hamburg')
		hamburgid = i;
});
var lastcityid = (Ti.App.Properties.hasProperty('LASTCITYID') ? Ti.App.Properties.getInt('LASTCITYID') : hamburgid);
console.log('Info: lastcityid = ' + lastcityid);

if (!String.prototype.rtrim) {! function() {
		String.prototype.rtrim = function() {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		};
	}();
}

module.exports = function(_event) {
	function renderNodes(_args) {
		_event.source.progress.setRefreshing(false);
		_event.source.spinner.hide();
		if (!_event.source.mapView)
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
					subtitle : (subtitles.length) ? subtitles.join('\n') : undefined
				};
			});
			_event.source.mapView.setRegion(_args.region);
			_event.source.mapView.regionset = true;
			setTimeout(function() {
				_event.source.mapView.regionset = false;
			}, 1000);
			Ti.UI.createNotification({
				message : String.format(L('PARAT'), points.length)
			}).show();
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
				_event.source.mapView.removePolygon(DomainPolygon);
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
				map : _event.source.mapView,
				image : '/images/freifunk.png',
				points : points,
				rightImage : '/images/pfeil.png'
			});
			_event.source.mapView.addPolygon(DomainPolygon);
		} else {
			Ti.UI.createNotification({
				message : "Verbindung zum Server gestört."
			}).show();
		}
	};

	ActionBar.setTitle('Freifunk');
	ActionBar.setFont('Roboto Condensed');
	ActionBar.setSubtitle(lastcity);
	ActionBar.subtitleColor = "#444";
	ActionBar.setBackgroundColor('#F9EABA');
	_event.source.progress.setRefreshing(true);
	_event.source.spinner.show();
	console.log(lastcityid);
	console.log(domainlist[lastcityid]);

	Freifunk.loadNodes({
		url : domainlist[lastcityid].url,
		done : renderNodes
	});
	console.log('Info: load nodes from ' + domainlist[lastcityid].name);
	var activity = _event.source.getActivity();
	if (!activity)
		return;
	activity.onCreateOptionsMenu = function(_menuevent) {
		console.log('onCreateOptionsMenu');
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
		domainlist.forEach(function(city, i) {
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
					url : domainlist[i].url,
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
