;! function() {
	var m = require('ui/main');
	m();
	new (require('adapter/domainlist'))();
	require('adapter/feed')({});
	require('vendor/versionsreminder')();
}();
