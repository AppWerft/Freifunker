var ActionBar = require('com.alcoapps.actionbarextras');

var Moment = require('vendor/moment');
Moment.locale('de');
var Map = require('ti.map');

if (!String.prototype.rtrim) {! function() {
		String.prototype.rtrim = function() {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		};
	}();
}

module.exports = function(_event) {
	ActionBar.setTitle('Freifunk');
	ActionBar.setFont('Roboto Condensed');
	//	ActionBar.setSubtitle(lastcity);
	ActionBar.subtitleColor = "#444";
	ActionBar.setBackgroundColor('#F9EABA');
	_event.source.spinner.show();
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
		_menuevent.menu.add({
			title : 'Nodes erneuern',
			itemId : '4',
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		}).addEventListener("click", _event.source.reloadDomain);
		_menuevent.menu.add({
			title : 'Karte zu mir!',
			itemId : '2',
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		}).addEventListener("click", function() {
			var GeoRoute = require('vendor/georoute').createGeo();
			GeoRoute.addEventListener('position', function(_e) {
				console.log(_e);
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
		_menuevent.menu.add({
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
		});
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
			checkable : true,
			enabled : false,
			itemId : '3',
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		}).addEventListener("click", function() {
			Ti.UI.createNotification({
				message : 'noch nicht realisiert'
			}).show();
		});

		activity.actionBar.displayHomeAsUp = false;
	};
	activity && activity.invalidateOptionsMenu();
	activity.actionBar.onHomeIconItemSelected = function(_e) {
	};
};
