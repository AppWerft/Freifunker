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
	self.addDomain2List = function() {
		if (domainlist.length) {
			var domain = domainlist.pop();
			self && self.spinner.show();
			ActionBar.setSubtitle('Hole Daten für ' + domain.name + ' …');
			Freifunk.loadNodes({
				url : domain.url,
				name : domain.name,
				done : function(_nodes) {
					self && self.spinner.hide();
					ActionBar.setSubtitle('Daten für ' + domain.name + ' erhalten');
					_nodes && list.insertRowBefore(0, require('ui/domains.row')(domain, _nodes));
					self.addDomain2List();
				}
			});
		} else
			console.log('Info: last domain ');
	};
	self.addDomain2List();
	self.addEventListener('open', require('ui/domains.actionbar'));
	self.addEventListener('close', function() {
		domainlist = [];
		self = null;
	});
	self.add(self.spinner);
	return self;
};
