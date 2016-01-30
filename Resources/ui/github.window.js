module.exports = function() {
	var $ = Ti.UI.createWindow({
		title : 'Github',
		backgroundColor : '#F9EABA'
	});
	$.web = Ti.UI.createWebView({
		top : 75,
		touchEnabled : true,
		scalesPageToFit : true,
		enableZoomControls : false,
		willHandleTouches : false,
		borderRadius : 1,
		disableBounce : true,
		url : 'https://github.com/AppWerft/Freifunker/'
	});
	$.add($.web);
	$.web.addEventListener('load', function() {
		$.spinner && $.spinner.hide();
	});
	$.addEventListener('open', require('ui/github.actionbar'));
	$.spinner = Ti.UI.createActivityIndicator({
		height : Ti.UI.SIZE,
		width : Ti.UI.SIZE,
		visible : true,
		zIndex : 999,
		style : (Ti.Platform.name === 'iPhone OS') ? Ti.UI.iPhone.ActivityIndicatorStyle.BIG : Ti.UI.ActivityIndicatorStyle.BIG
	});
	$.add($.spinner);
	$.spinner.show();
	$.addEventListener('androidback', function() {
		if ($.web.canGoBack()) {
			$.web.goBack();
		} else {
			$.close();
		}
	});
	$.open();
};
