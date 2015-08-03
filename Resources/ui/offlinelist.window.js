var Moment = require('vendor/moment');
Moment.locale('de');
var Freifunk = new (require('adapter/freifunk'))();
var Geo = require('vendor/georoute').createGeo();

module.exports = function() {
	var self = Ti.UI.createWindow({
		fullscreen : false,
		backgroundColor : '#F9EABA',
		orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
	});

	self.listview = Ti.UI.createListView({
		top : 74,
		sections : [Ti.UI.createListSection()],
		backgroundColor : '#fff',
		templates : {
			'node' : require('ui/TEMPLATES').node,
		},
		defaultItemTemplate : 'node',
	});
	self.listview.addEventListener('itemclick', function(_e) {
		var item = _e.section.getItemAt(_e.itemIndex);
		var node = JSON.parse(item.properties.itemId);
		var win = Ti.UI.createWindow({
			theme : 'Theme.NoActionBar',
			fullscreen : true
		});
		self.compass = require('ui/compass').createView(node);
		self.compass.start();
		win.add(self.compass);
		win.addEventListener('close', function() {
			self.compass.stop();
			self.remove(self.compass);
			self.compass = null;
		});
		win.open();
		return;
		item.address.color = 'transparent';
		_e.section.updateItemAt(_e.itemIndex, item);
		Geo.getAddress({
			latitude : node.lat,
			longitude : node.lon
		}, function(_res) {
			var address = _res.street + ' ' + _res.street_number;
			Freifunk.setAddress(node.nodeid, address);
			item.address.text = address;
			item.address.color = '#555';
			_e.section.updateItemAt(_e.itemIndex, item);
		});
	});

	self.add(self.listview);
	function updateList() {
		Freifunk.getNodes(function(nodes) {
			var items = nodes.map(function(node) {
				return {
					properties : {
						itemId : JSON.stringify(node)
					},
					logo : {
						image : node.logo
					},
					name : {
						text : node.name
					},
					address : {
						text : (node.address.length > 0) ? node.address : 'Klick um Adresse anzuzeigen',
						opacity : (Ti.Network.online || node.address.length > 0) ? 1 : 0,
						color : (node.address.length > 0) ? '#555' : '#ccc',
					},
					distance : {
						text : 'Entfernung: ' + node.distance
					},
					bearing : {
						text : '⇧Richtung: ' + node.bearing + '° (' + node.compassPoint + ')'
					}
				};
			});
			self.listview && self.listview.sections[0] && self.listview.sections[0].setItems(items);
		});
	}


	self.addEventListener('updateList', updateList);
	Ti.Android && self.addEventListener('open', require('ui/offlinelist.actionbar'));
	return self;
};
