;! function() {
	require('ui/main')();
	new (require('adapter/domainlist'))();
	require('adapter/feed')({});
	require('vendor/versionsreminder')();
}();
