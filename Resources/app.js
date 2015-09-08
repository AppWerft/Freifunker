;! function() {
	require('de.appwerft.geotools').loadKML(Ti.App.Properties.getString('refugees')).then(function(_e) {
		console.log(_e);
	});
	require('ui/main')();
	new (require('adapter/domainlist'))();
	require('adapter/feed')({});
	require('vendor/versionsreminder')();
}();
