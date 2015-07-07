var ActionBar = require('com.alcoapps.actionbarextras');
var Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function(_event) {
	ActionBar.setTitle('Freifunkerneuigkeiten');
	ActionBar.setFont('Roboto Condensed');
	ActionBar.setSubtitle(_event.source.title);
	ActionBar.subtitleColor = "#444";
	ActionBar.setBackgroundColor('#F9EABA');
	var activity = _event.source.getActivity();
	if (!activity)
		return;
	activity.onCreateOptionsMenu = function(_menuevent) {
		_menuevent.menu.clear();
		activity.actionBar.displayHomeAsUp = true;
	};
	activity && activity.invalidateOptionsMenu();
	activity.actionBar.onHomeIconItemSelected = function(_e) {
		_event.source.close();
	};
};
