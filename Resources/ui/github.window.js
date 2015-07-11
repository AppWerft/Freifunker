module.exports = function() {
	var self = Ti.UI.createWindow({
		title : 'Github',
		backgroundColor : '#F9EABA'
	});
	var web = Ti.UI.createWebView({
		top : 74,
		touchEnabled : true,
		disableBounce : true,
		scalesPageToFit : true,
		enableZoomControls : false,
		willHandleTouches : false,
		borderRadius : 1,
		disableBounce : true,
		url : 'https://github.com/AppWerft/Freifunker/'
	});
	self.add(web);
	self.addEventListener('open', require('ui/github.actionbar'));
	self.addEventListener('androidback', function() {
		if (web.canGoBack()) {
			web.goBack();
		} else {
			self.close();
		}
	});
	self.open();
}; 