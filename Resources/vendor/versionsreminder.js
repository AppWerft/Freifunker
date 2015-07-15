function str2int(foo) {
	var parts = foo.split('.');
	return 100000 * parts[0] + 1000 * parts[1] + parts[2];
}

module.exports = function() {
	var thisversion = str2int(Ti.App.getVersion());
	var e = (arguments[0] || {}, "https://play.google.com/store/apps/details?id=" + Ti.App.getId()),
	    t = Ti.Network.createHTTPClient({
		onerror : function() {
			console.log('Warning: no connection to playstore ' + thisversion);
			return;
		},
		onload : function() {
			var t = /itemprop="softwareVersion">(.*?)</m.exec(this.responseText);
			if (!t) {
				console.log('Warning: no connection to playstore ' + thisversion);
				return;
			}
			var storeversion = str2int(( version = t[1].replace(/\s+/g, "")));
			if (storeversion > thisversion) {
				var dialog = Ti.UI.createAlertDialog({
					cancel : 1,
					buttonNames : [L('VERSION_TOSTORE'),L("VERSION_CANCEL")],
					message : String.format(L('VERSION_MUSTUPDATE'), Ti.Platform.model, Ti.App.getVersion(), storeversion),
					title : String.format(L('VERSION_NEWEST'), Ti.App.getName())
				});
				dialog.show();
				dialog.addEventListener("click", function(t) {
					t.index != t.source.cancel && Ti.Platform.openURL(e);
				});
			} else if (storeversion < thisversion) {
				Ti.Android && Ti.UI.createNotification({
					message : Ti.App.getName() + " ist neuer als neu … (" + Ti.App.getVersion() + ")"
				}).show();
			} else if (storeversion == thisversion)
				Ti.Android && Ti.UI.createNotification({
					message : String.format(L('VERSION_NEWEST'), Ti.App.getVersion())
				}).show();
		}
	});
	t.open("GET", e), t.send();
};
