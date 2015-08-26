module.exports = function(domain, res) {
	var row = Ti.UI.createTableViewRow({
		height : Ti.UI.SIZE,
	});

	row.add(Ti.UI.createLabel({
		text : domain.name,
		top : 5,
		left : 5,
		textAlign : 'left',
		width : Ti.UI.FILL,
		color : '#DA1068',
		font : {
			fontSize : 22,
			fontFamily : 'Roboto Condensed'
		}
	}));
	if (res) {
		row.add(Ti.UI.createLabel({
			text : res.response.replace(/\:/gm,' :  '),
			top : 36,
			left : 5,
			textAlign : 'left',
			width : Ti.UI.FILL,
			color : '#444',
			font : {
				fontSize : 14,
				fontFamily : 'Roboto Condensed'
			}
		}));
		row.add(Ti.UI.createLabel({
			text : (res.time / 1000).toFixed(2) + ' s',
			top : 0,
			right : 10,
			textAlign : 'right',
			width : Ti.UI.SIZE,
			color : 'gray',
			font : {
				fontSize : 32,
				fontFamily : 'Roboto Condensed'
			}
		}));
	} else {
		row.backgroundColor='66ff0000';
	}
	return row;
};
