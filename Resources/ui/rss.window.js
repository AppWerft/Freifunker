var Moment = require('vendor/moment');
Moment.locale('de');

var Map = require('ti.map');

module.exports = function() {
	var self = Ti.UI.createWindow({
		fullscreen : false,
		orientationModes : []
	});
	var listview = Ti.UI.createListView();
	if (Ti.Android) {
		self.progress = require('com.rkam.swiperefreshlayout').createSwipeRefresh({
			view : listview,
			height : 20,
			top : 74,
			width : Ti.UI.FILL
		});
		self.add(self.progress);
	}
	Ti.Android && self.addEventListener('open', require('ui/rss.actionbar'));
	return self;
};
