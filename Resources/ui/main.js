module.exports = function() {// create tab group
	var tabGroup = Titanium.UI.createTabGroup({
		exitOnClose : true,
		fullscreen : true
	});

	var win1 = Titanium.UI.createWindow({
		title : 'Tab 1',
		backgroundColor : '#fff'
	});
	var tab1 = Titanium.UI.createTab({

		title : 'Karte',
		window : win1
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

	// open tab group
	tabGroup.open();
};
