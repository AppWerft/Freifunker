var Moment = require('vendor/moment');
Moment.locale('de');
var Freifunk = new (require('adapter/freifunk'))();

module.exports = function() {
	var self = Ti.UI.createWindow({
		fullscreen : false,
		backgroundColor : '#F9EABA',
		orientationModes : []
	});
	var listview = Ti.UI.createListView({
		top : 74,
		sections : [Ti.UI.createListSection()],
		backgroundColor : '#fff',
		templates : {
			'node' : require('ui/TEMPLATES').node,
		},
		defaultItemTemplate : 'node',
	});
	self.add(listview);
	setTimeout(function() {
		var nodes = Freifunk.getNodes();
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
				distance : {
					text : 'Entfernung: ' + node.distance
				},
				bearing : {
					text : 'Richtung: ' + node.bearing + '° (' + node.compassPoint + ')'
				}
			};
		});
		listview.sections[0].setItems(items);
	}, 500);
	Ti.Android && self.addEventListener('open', require('ui/offlinelist.actionbar'));
	return self;
};
