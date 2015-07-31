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

const RENEW = 0,
    LUFTBILD = 1,
    OWNPOSITION = 2,
    DOCACHE = 3,
    OFFLINE = 4,
    ONLYACTIVE = 5;

module.exports = function() {
	var win = arguments[0].source;
	console.log(win.apiName);
	ActionBar.setTitle('Freifunk');
	ActionBar.setFont('Roboto Condensed');
	ActionBar.subtitleColor = "#444";
	ActionBar.setBackgroundColor('#F9EABA');
	win.spinner.show();
	var activity = win.getActivity();
	if (activity) {
		activity.onCreateOptionsMenu = function() {
			var menu = arguments[0].menu;
			menu.clear();
			menu.add({
				title : 'GITHUB',
				icon : Ti.App.Android.R.drawable.ic_action_github,
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
			}).addEventListener("click", require('ui/github.window'));
			menu.add({
				title : 'RSS',
				icon : Ti.App.Android.R.drawable.ic_action_rss,
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
			}).addEventListener("click", function() {
				require('ui/rss.window')().open();
			});
			menu.add({
				title : 'Nodes erneuern',
				itemId : RENEW,
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			}).addEventListener("click", win.reloadDomain);
			menu.add({
				title : 'Karte zu mir!',
				itemId : OWNPOSITION,
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			}).addEventListener("click", function() {
				var GeoRoute = require('vendor/georoute').createGeo();
				GeoRoute.addEventListener('position', function(_e) {
					win.mapView.setLocation({
						latitude : _e.coords.latitude,
						longitude : _e.coords.longitude,
						animate : true,
						latitudeDelta : 0.5,
						longitudeDelta : 0.5
					});
				});
				GeoRoute.getLocation();
			});
			/*menu.add({
			 title : 'nur aktive',
			 itemId : ONLYACTIVE,
			 checkable : true,
			 enabled : false,
			 checked : true,
			 showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			 }).addEventListener("click", function(_e) {
			 var item = _menuevent.findItem(ONLYACTIVE);
			 item.checked = (item.isChecked()) ? false : true;
			 Ti.UI.createNotification({
			 message : 'noch nicht realisiert'
			 }).show();
			 });*/
			menu.add({
				title : 'Luftbild',
				itemId : LUFTBILD,
				checkable : true,
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			}).addEventListener("click", function(_e) {
				var item = menu.findItem(LUFTBILD);
				item.checked = (item.isChecked()) ? false : true;
				win.mapView.setMapType(item.isChecked() ? Map.HYBRID_TYPE : Map.NORMAL_TYPE);
			});
			menu.add({
				title : 'Nodes cachen',
				itemId : DOCACHE,
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			}).addEventListener("click", function() {
				require('ui/domains.window')().open();
			});
			menu.add({
				title : 'Offlineliste',
				itemId : OFFLINE,
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			}).addEventListener("click", function() {
				require('ui/offlinelist.window')().open();
			});
			activity.actionBar.displayHomeAsUp = false;
		};
		activity.onPrepareOptionsMenu = function(_event) {
			var menu = _event.menu;
			menu.findItem(DOCACHE).setEnabled(Ti.Network.online && Ti.Network.networkType == Ti.Network.NETWORK_WIFI ? true : false);
			menu.findItem(RENEW).setEnabled(Ti.Network.online ? true : false);
			menu.findItem(OWNPOSITION).setEnabled(Ti.Geolocation.getLocationServicesEnabled() ? true : false);
			var total = Freifunk.getNodesTotal();
			total && menu.findItem(OFFLINE).setTitle('Offlineliste ' + '(' + total + ')');
			menu.findItem(OFFLINE).setEnabled(total && Ti.App.Properties.hasProperty('lastGeolocation') ? true : false);
		};
		activity && activity.invalidateOptionsMenu();
		activity.actionBar.onHomeIconItemSelected = function(_e) {
		};
	}
};
