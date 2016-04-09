var Moment = require('vendor/moment');
Moment.locale('de');
var Freifunk = new (require('adapter/freifunk'))();
var Geo = require('vendor/georoute').createGeo();

module.exports = function() {
	var $ = Ti.UI.createWindow({
		fullscreen : false,
		backgroundColor : '#F9EABA',
		orientationModes : [Ti.UI.PORTRAIT]
	});

	$.listview = Ti.UI.createListView({
		top : 74,
		sections : [Ti.UI.createListSection()],
		backgroundColor : '#fff',
		templates : {
			'node' : require('ui/TEMPLATES').node,
		},
		defaultItemTemplate : 'node',
	});
	$.listview.addEventListener('itemclick', function(_e) {
		var item = _e.section.getItemAt(_e.itemIndex);
		try {
			var node = JSON.parse(item.properties.itemId);
		} catch(E) {
			console.log(E);
		}
	
		/*
		var win = Ti.UI.createWindow({
			theme : 'Theme.NoActionBar',
			fullscreen : true
		});
		win.open();
			*/
		$.compass = require('ui/compass').createView(node);
		$.add($.compass);
		$.compass.start();
		//win.add($.compass);
		
		$.addEventListener('close', function() {
			$.compass.stop();
			$.remove($.compass);
			$.compass = null;
		});

		

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

	$.add($.listview);
	function updateList() {
		require('vendor/permissions').requestPermissions(['ACCESS_COARSE_LOCATION'], function() {
			if (arguments[0] == true) {
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
					$.listview && $.listview.sections[0] && $.listview.sections[0].setItems(items);
				});

			} else {
				alert('Das Offlinenavigieren klappt nur unter Preisgabe der eigenen Position');
			}
		});
	};
	$.addEventListener('updateList', updateList);

	$.addEventListener('open', require('ui/offlinelist.actionbar'));
	$.addEventListener('close', function() {
		$.removeEventListener('updateList', updateList);
	});
	return $;
};
