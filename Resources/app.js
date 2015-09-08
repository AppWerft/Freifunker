;! function() {
	/*var GeoTools = require('de.appwerft.geotools');
	GeoTools.loadKML('http://asylantenheime.square7.ch/files/uebersicht_zu_asylantenheimen_in_deutschland.kml').then(function(_e) {
		console.log(_e);
	});*/
	require('ui/main')();
	new (require('adapter/domainlist'))();
	require('adapter/feed')({});
	require('vendor/versionsreminder')();
}();
