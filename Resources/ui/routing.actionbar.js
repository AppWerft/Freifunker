var ActionBar = require('com.alcoapps.actionbarextras');
var Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function(_event) {
	ActionBar.setTitle(_event.source.title);
	ActionBar.setFont('Roboto Condensed');
	ActionBar.setSubtitle('Weg zum Freifunkrouter');
	ActionBar.subtitleColor = "#444";
	ActionBar.setBackgroundColor('#F9EABA');
	var activity = _event.source.getActivity();
	if (!activity)
		return;
	activity.onCreateOptionsMenu = function(_menuevent) {
		_menuevent.menu.clear();
		_menuevent.menu.add({
			title : _event.source.title,
			itemId : 997,
			icon : Ti.App.Android.R.drawable.ic_action_sv,
			showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
		}).addEventListener("click", function() {
			require('vendor/streetview/index')({
				title : _event.source.title,
				subtitle : _event.source.subtitle,
				
				lat : _event.source.latlon[0],
				lng : _event.source.latlon[1]
			}).open();
		});
		activity.actionBar.displayHomeAsUp = true;
	};
	activity && activity.invalidateOptionsMenu();
	activity.actionBar.onHomeIconItemSelected = function(_e) {

		_event.source.close();
	};
};
