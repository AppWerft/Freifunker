module.exports = function() {// create tab group
	var tabGroup = Titanium.UI.createTabGroup({
		exitOnClose : true,
		fullscreen : true
	});

	var tab1 = Ti.UI.createTab({
		title : 'Karte',
		window : require('ui/map.window')()
	});

	//
	// create controls tab and root window
	//
	var win2 = Titanium.UI.createWindow({
		title : 'Liste',
		backgroundColor : '#fff'
	});
	var tab2 = Titanium.UI.createTab({
		title : 'Liste',
		window : win2
	});

	//
	//  add tabs
	//
	tabGroup.addTab(tab1);
	tabGroup.addTab(tab2);
	tabGroup.addEventListener('open', require('ui/main.actionbar'));
	// open tab group
	tabGroup.open();
};
