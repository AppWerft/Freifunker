var ActionBar = require('com.alcoapps.actionbarextras');
var Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function(_event) {
	ActionBar.setTitle('Freifunker');
	ActionBar.setFont('Roboto Condensed');
	ActionBar.setSubtitle('Router in Deiner Umgebung');
	ActionBar.subtitleColor = "#444";
	ActionBar.setBackgroundColor('#F9EABA');
	var activity = _event.source.getActivity();
	if (!activity)
		return;
	activity.onCreateOptionsMenu = function(_menuevent) {
		var menu = _menuevent.menu;
		menu.clear();
		menu.add({
			title : 'Eigene Position bestimmen und Liste anpassen',
			icon : Ti.App.Android.R.drawable.ic_action_reload,
			showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
		}).addEventListener("click", function() {
			_event.source.fireEvent('updateList');
		});
		activity.actionBar.displayHomeAsUp = true;
	};
	activity && activity.invalidateOptionsMenu();
	activity.actionBar.onHomeIconItemSelected = function(_e) {
		_event.source.close();
	};
};
