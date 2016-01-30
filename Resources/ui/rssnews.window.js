module.exports = function(options) {
	var $ = Ti.UI.createWindow({
		title : options.title,
		backgroundColor : '#F9EABA',
		spinner : Ti.UI.createActivityIndicator({
			height : Ti.UI.SIZE,
			width : Ti.UI.SIZE,
			visible : true,
			zIndex : 999,
			style : (Ti.Platform.name === 'iPhone OS') ? Ti.UI.iPhone.ActivityIndicatorStyle.BIG : Ti.UI.ActivityIndicatorStyle.BIG
		})
	});
	$.web = Ti.UI.createWebView({
		top : 74,
		touchEnabled : true,
		disableBounce : true,
		scalesPageToFit : true,
		enableZoomControls : false,
		willHandleTouches : false,
		borderRadius : 1,
		disableBounce : true,
		url : options.link,
	});
	$.web.addEventListener('load', function() {
		$.spinner.hide();
		$.remove($.spinner);
	});
	$.add($.web);
	$.add($.spinner);
	$.addEventListener('androidback', function() {
		if ($.web.canGoBack()) {
			$.web.goBack();
		} else {
			$.$.close();
		}
	});
	$.addEventListener('open', require('ui/web.actionbar'));
	return $;
};
