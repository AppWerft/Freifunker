var ActionBar = require('com.alcoapps.actionbarextras');

var Moment = require('vendor/moment');
Moment.locale('de');

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
			title : 'nur aktive',
			itemId : 998,
			checkable : true,
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		}).addEventListener("click", function() {
			Ti.UI.createNotification({
				message : 'noch nicht realisiert'
			}).show();
		});
		_menuevent.menu.add({
			title : 'Karte zu mir!',
			itemId : 997,
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
			title : 'Nodes cachen',
			checkable : true,
			itemId : 996,
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		}).addEventListener("click", function() {
			Ti.UI.createNotification({
				message : 'noch nicht realisiert'
			}).show();
		});
		_menuevent.menu.add({
			title : 'Nodes erneuern',
			itemId : 996,
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		}).addEventListener("click", _event.source.reloadDomain);
		activity.actionBar.displayHomeAsUp = false;
	};
	activity && activity.invalidateOptionsMenu();
	activity.actionBar.onHomeIconItemSelected = function(_e) {
	};
};
