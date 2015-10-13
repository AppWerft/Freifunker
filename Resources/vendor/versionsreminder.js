
/** Compare two dotted version strings (like '10.2.3').
 * @returns {Integer} 0: v1 == v2, -1: v1 < v2, 1: v1 > v2
 */
var versionCompare = function(v1, v2) {
	var v1parts = ("" + v1).split("."),
	    v2parts = ("" + v2).split("."),
	    minLength = Math.min(v1parts.length, v2parts.length),
	    p1,
	    p2,
	    i;
	// Compare tuple pair-by-pair.
	for ( i = 0; i < minLength; i++) {
		// Convert to integer if possible, because "8" > "10".
		p1 = i/* > 0 */ ? parseFloat('0.' + v1parts[i], 10) : parseInt(v1parts[i], 10);
		;
		p2 = i/* > 0 */ ? parseFloat('0.' + v2parts[i], 10) : parseInt(v2parts[i], 10);
		if (isNaN(p1)) {
			p1 = v1parts[i];
		}
		if (isNaN(p2)) {
			p2 = v2parts[i];
		}
		if (p1 == p2) {
			continue;
		} else if (p1 > p2) {
			return 1;
		} else if (p1 < p2) {
			return -1;
		}
		// one operand is NaN
		return NaN;
	}
	// The longer tuple is always considered 'greater'
	if (v1parts.length === v2parts.length) {
		return 0;
	}
	return (v1parts.length < v2parts.length) ? -1 : 1;
};

module.exports = function() {
	var thisversion = Ti.App.getVersion();
	var url = (arguments[0] || {}, "https://play.google.com/store/apps/details?id=" + Ti.App.getId()),
	    xhr = Ti.Network.createHTTPClient({
		onerror : function() {
			console.log('Warning: no connection to playstore ' + thisversion);
			return;
		},
		onload : function() {
			var res = /itemprop="softwareVersion">(.*?)</m.exec(this.responseText);
			if (!res) {
				console.log('Warning: no connection to playstore ' + thisversion);
				return;
			}
			var storeversion = res[1].replace(/\s+/g, "");
			console.log('Store=['+storeversion + '] app=['+Ti.App.getVersion() + ']');
			switch (versionCompare(Ti.App.getVersion(),storeversion)) {
			case -1:
				var dialog = Ti.UI.createAlertDialog({
					cancel : 1,
					buttonNames : ["Zum Store", "Abbruch"],
					message : "Es gibt eine neue Version im Playstore.\n\nDiese App auf dem " + Ti.Platform.model + ' hat die Version ' + Ti.App.getVersion() + "\n\nIm Store ist  " + storeversion + ".\n\nMöchtest Du erneuern?",
					title : "Neue Version „" + Ti.App.getName() + "“"
				});
				dialog.show();
				dialog.addEventListener("click", function(e) {
					e.index != e.source.cancel && Ti.Platform.openURL(url);
				});
				break;
			case 1:
				Ti.Android && Ti.UI.createNotification({
					message : Ti.App.getName() + " ist neuer als neu … (" + Ti.App.getVersion() + ")"
				}).show();
				break;
			case 0 :
				Ti.Android && Ti.UI.createNotification({
					message : Ti.App.getName() + " ist in neuester Version (" + Ti.App.getVersion() + ")"
				}).show();
				break;
				default:
				console.log('Warning: versions compare has error');
			}
		}
	});
	xhr.open("GET", url), xhr.send();
};
