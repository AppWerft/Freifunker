(function() {
	require('ui/main')();
//	require('adapter/ffmap')();
	require('adapter/feed')({});
	require('vendor/versionsreminder')();
})();
