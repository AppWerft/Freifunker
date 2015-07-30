module.exports = function() {
	
	var self = require('ui/map.window')();
	self.addEventListener('open', require('ui/main.actionbar'));
	self.open();
	self.addEventListener("android:back", function(_e) {//listen for the back-button-tap event
		_e.cancelBubble = true;
		var intent = Ti.Android.createIntent({
			action : Ti.Android.ACTION_MAIN,
			flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK
		});
		intent.addCategory(Ti.Android.CATEGORY_HOME);
		Ti.Android.currentActivity.startActivity(intent);
		return false;
	});
	return self;
};
