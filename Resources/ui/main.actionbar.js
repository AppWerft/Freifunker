var ActionBar = require('com.alcoapps.actionbarextras');

var Moment = require('vendor/moment');
Moment.locale('de');
var Map = require('ti.map');
var Freifunk = new (require('adapter/freifunk'))();

if (!String.prototype.rtrim) {! function() {
		String.prototype.rtrim = function() {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		};
	}();
}

module.exports = function(_event) {
	console.log('===========\nonWindowOpen\n===========');
	ActionBar.setTitle('Freifunk');
	ActionBar.setFont('Roboto Condensed');
	//	ActionBar.setSubtitle(lastcity);
	ActionBar.subtitleColor = "#444";
	ActionBar.setBackgroundColor('#F9EABA');
	_event.source.spinner.show();
	var activity = _event.source.getActivity();
	if (!activity)
		return;
	activity.onPrepareOptionsMenu = function(_menuevent) {
		console.log('===========\nonCreateOptionsMenu\n===========');
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
		_menuevent.menu.add({
			title : 'Nodes erneuern',
			itemId : '4',
			enabled : Ti.Network.online ? true : false,
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		}).addEventListener("click", _event.source.reloadDomain);
		_menuevent.menu.add({
			title : 'Karte zu mir!',
			itemId : '2',
			enabled : Ti.Geolocation.getLocationServicesEnabled() ? true : false,
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		}).addEventListener("click", function() {
			var GeoRoute = require('vendor/georoute').createGeo();
			GeoRoute.addEventListener('position', function(_e) {
				_event.source.mapView.setLocation({
					latitude : _e.coords.latitude,
					longitude : _e.coords.longitude,
					animate : true,
					latitudeDelta : 0.5,
					longitudeDelta : 0.5
				});
			});
			GeoRoute.getLocation();
		});
		/*_menuevent.menu.add({
		 title : 'nur aktive',
		 itemId : '1',
		 checkable : true,
		 enabled : false,
		 checked : true,
		 showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		 }).addEventListener("click", function(_e) {
		 var item = _menuevent.findItem('1');
		 item.checked = (item.isChecked()) ? false : true;
		 Ti.UI.createNotification({
		 message : 'noch nicht realisiert'
		 }).show();
		 });*/
		_menuevent.menu.add({
			title : 'Luftbild',
			itemId : '5',
			checkable : true,
			checked : false,
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		}).addEventListener("click", function(_e) {
			var item = _menuevent.menu.findItem('5');
			item.checked = (item.isChecked()) ? false : true;
			_event.source.mapView.setMapType(item.isChecked() ? Map.HYBRID_TYPE : Map.NORMAL_TYPE);
		});
		_menuevent.menu.add({
			title : 'Nodes cachen',
			checkable : false,
			enabled : Ti.Network.online && Ti.Network.networkType == Ti.Network.NETWORK_WIFI ? true : false,
			itemId : '3',
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		}).addEventListener("click", function() {
			require('ui/domains.window')().open();
		});
		var nodes = Freifunk.getNodes();
		_menuevent.menu.add({
			title : 'Offlineliste ' + '('+nodes.length+')',
			checkable : false,
			enabled : nodes.length ? true : false,
			itemId : '7',
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		}).addEventListener("click", function() {
			//require('ui/domains.window')().open();
		});
		
		activity.actionBar.displayHomeAsUp = false;
	};
	activity && activity.invalidateOptionsMenu();
	activity.actionBar.onHomeIconItemSelected = function(_e) {
	};
};
