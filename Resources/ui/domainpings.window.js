var Freifunk = new (require('adapter/freifunk'))();

var ActionBar = require('com.alcoapps.actionbarextras');

module.exports = function() {
	var DomainList = new (require('adapter/domainlist'))();
	domainlist = DomainList.getList();
	var event = arguments[0] || {};
	var self = Ti.UI.createWindow({
		fullscreen : false,
		backgroundColor : '#F9EABA',
		orientationModes : [],
		spinner : Ti.UI.createActivityIndicator({
			height : Ti.UI.SIZE,
			width : Ti.UI.SIZE,
			visible : true,
			zIndex : 999,
			style : (Ti.Platform.name === 'iPhone OS') ? Ti.UI.iPhone.ActivityIndicatorStyle.BIG : Ti.UI.ActivityIndicatorStyle.BIG
		})
	});
	
	var list = Ti.UI.createTableView({
		top : 76,
		backgroundColor : '#fff'
	});
	self.add(list);
	self.addDomainPings2List = function() {
		if (domainlist.length) {
			var domain = domainlist.pop();
			self && self.spinner.show();
			ActionBar.setSubtitle('HEAD request ' + domain.name + ' …');
			Freifunk.pingNodes({
				url : domain.url,
				timeout : 10000,
				name : domain.name,
				done : function(_res) {
					self && self.spinner.hide();
					console.log(_res);
					_res && list.insertRowBefore(0, require('ui/ping.row')(domain, _res));
					self && self.addDomainPings2List();
					return;
					;
				}
			});
		} else
			console.log('Info: last domain ');
	};
	self.addDomainPings2List();
	self.addEventListener('open', require('ui/domains.actionbar'));
	self.addEventListener('close', function() {
		domainlist = [];
		self = null;
	});
	self.add(self.spinner);
	return self;
};
