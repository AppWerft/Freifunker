exports.requestPermissions = function(_permissions, _callback) {
	if (Ti.Platform.osname != 'android') {
		_callback(true);
		return;
	}
	console.log('Info: Android: starting permissioncontroler');
	var permissions = (Array.isArray(_permissions) ? _permissions : [_permissions]).map(function(perm) {
		return (perm.match(/^android\.permission\./)) ? perm : 'android.permission.' + perm;
	});
	var grantedpermissions = 0;
	var TiPermissions = require('ti.permissions');
	permissions.forEach(function(perm,i) {
		console.log('Info: permission ' + perm);
		if (TiPermissions.hasPermission(perm)) 
			grantedpermissions++;
		
		if (grantedpermissions == permissions.length)
			_callback(true);
	});
	if (grantedpermissions < permissions.length) {
		console.log('Info: permission granting required ' + permissions.length);
		TiPermissions.requestPermissions(permissions, function(_e) {
			console.log(_e);
			_callback(_e.success);
		});
	}
};
