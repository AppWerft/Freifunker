// create tab group
var tabGroup = Titanium.UI.createTabGroup();

var bar = Object.keys(require('model/urls').cities).map(function(c) {
	return {
		name: c,
		url : require('model/urls').cities[c]
	};
});
console.log(JSON.stringify(bar));
//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({
	title : 'Tab 1',
	backgroundColor : '#fff'
});
var tab1 = Titanium.UI.createTab({

	title : 'Tab 1',
	window : win1
});

var label1 = Titanium.UI.createLabel({
	color : '#999',
	text : 'I am Window 1',
	font : {
		fontSize : 20,
		fontFamily : 'Helvetica Neue'
	},
	textAlign : 'center',
	width : 'auto'
});

win1.add(label1);

//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({
	title : 'Tab 2',
	backgroundColor : '#fff'
});
var tab2 = Titanium.UI.createTab({
	title : 'Tab 2',
	window : win2
});

var label2 = Titanium.UI.createLabel({
	color : '#999',
	text : 'I am Window 2',
	font : {
		fontSize : 20,
		fontFamily : 'Helvetica Neue'
	},
	textAlign : 'center',
	width : 'auto'
});

win2.add(label2);

//
//  add tabs
//
tabGroup.addTab(tab1);
tabGroup.addTab(tab2);

// open tab group
tabGroup.open();
