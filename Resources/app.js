;! function() {
	//var intro = require('intro.window')();
	//intro.open();
	//setTimeout(function() {
		require('ui/main')();
	//}, 2000);
	new (require('adapter/domainlist'))();
	require('adapter/feed')({});
	require('vendor/versionsreminder')();
}();
