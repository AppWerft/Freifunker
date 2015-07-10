var ActionBar = require('com.alcoapps.actionbarextras');
var Map = require('ti.map');
var Moment = require('vendor/moment');
Moment.locale('de');
var MarkerManager = require('vendor/markermanager');
var Freifunk = new (require('adapter/freifunk'))();
var MM_Freifunk;
var Geo = new (require('vendor/georoute'))();
Geo.getLocation();

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
		done : function(_args) {
			_event.source.progress.setRefreshing(false);
			var points = _args.nodes.map(function(node) {
				return {
					lat : node.lat,
					lng : node.lon,
					id : node.id,
					title : node.name,
					subtitle: lastcity
				};
			});
			_event.source.mapView.setRegion(_args.region);
			Ti.UI.createNotification({
				message : 'Derweil sind ' + points.length + ' Nodes mit Standortangabe parat'
			}).show();
			MM_Freifunk = new MarkerManager({
				name : 'freifunk',
				map : _event.source.mapView,
				image : '/images/freifunk.png',
				points : points
			});
		}
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
		}).addEventListener("click", function() {
			var win = Ti.UI.createWindow({
				title : 'Github',backgroundColor : '#F9EABA'
			});
			var web = Ti.UI.createWebView({
				top : 74,
				touchEnabled : true,
				disableBounce : true,
				scalesPageToFit : true,
				enableZoomControls : false,
				willHandleTouches : false,
				borderRadius : 1,
				disableBounce : true,
				url : 'https://github.com/AppWerft/Freifunker/'
			});
			win.add(web);
			win.addEventListener('open', require('ui/github.actionbar'));
			win.addEventListener('androidback', function() {
				if (web.canGoBack()) {
					web.goBack();
				} else {
					win.close();
				}
			});
			win.open();
		});
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
					done : function(_args) {
						_event.source.progress.setRefreshing(false);
						var points = _args.nodes.map(function(node) {
							return {
								lat : node.lat,
								lng : node.lon,
								id : node.id,
								title : node.name,subtitle:_menuevent.menu.findItem(i).title
							};
						});

						_event.source.mapView.setRegion(_args.region);
						Ti.UI.createNotification({
							message : 'Derweil sind ' + points.length + ' Nodes mit Standortangabe im Netz ' + domains[i].name + ' parat'
						}).show();
						MM_Freifunk = new MarkerManager({
							name : 'freifunk',
							map : _event.source.mapView,
							image : '/images/freifunk.png',
							points : points
						});
					}
				});
			});
		});
		activity.actionBar.displayHomeAsUp = false;
	};
	activity && activity.invalidateOptionsMenu();
	activity.actionBar.onHomeIconItemSelected = function(_e) {

	};

};
