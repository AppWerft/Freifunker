(function() {
	require('ui/main')();
//	require('adapter/ffmap')();
	require('adapter/feed')({});
	require('vendor/versionsreminder')();
	
	require("appcelerator.encrypteddatabase").setPassword('TEST');
	Ti.Database.open('verschluesselt').close();
	
	
})();
