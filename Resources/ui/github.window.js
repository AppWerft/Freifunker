module.exports = function() {
	var self = Ti.UI.createWindow({
		title : 'Github',
		backgroundColor : '#F9EABA'
	});
	var web = Ti.UI.createWebView({
		top : 75,
		touchEnabled : true,
		scalesPageToFit : true,
		enableZoomControls : false,
		willHandleTouches : false,
		borderRadius : 1,
		disableBounce : true,
		url : 'https://github.com/AppWerft/Freifunker/'
	});
	self.add(web);

	web.addEventListener('load', function() {
		self.spinner && self.spinner.hide();
	});
	self.addEventListener('open', require('ui/github.actionbar'));
	self.addEventListener('androidback', function() {
		if (web.canGoBack()) {
			web.goBack();
		} else {
			self.close();
		}
	});
	self.spinner = Ti.UI.createActivityIndicator({
		height : Ti.UI.SIZE,
		width : Ti.UI.SIZE,
		visible : true,
		zIndex : 999,
		style : (Ti.Platform.name === 'iPhone OS') ? Ti.UI.iPhone.ActivityIndicatorStyle.BIG : Ti.UI.ActivityIndicatorStyle.BIG
	});
	self.add(self.spinner);
	self.spinner.show();
	self.open();
};
