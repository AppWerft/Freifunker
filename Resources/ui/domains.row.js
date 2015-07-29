module.exports = function(domain, nodes) {
	var row = Ti.UI.createTableViewRow({
		height : Ti.UI.SIZE
	});
	row.add(Ti.UI.createImageView({
		image : domain.image,
		top : 0,
		bottom : 5,
		left : 0,
		width : 90,
		height : 80
	}));
	row.add(Ti.UI.createView({
		top : 0,
		bottom : 10,
		left : 110,
		layout : 'vertical',
		height : Ti.UI.SIZE
	}));
	row.children[1].add(Ti.UI.createLabel({
		text : domain.name,
		top : 0,
		left : 0,
		textAlign : 'left',
		width : Ti.UI.FILL,
		color : 'black',
		font : {
			fontSize : 27,
			fontFamily : 'Roboto Condensed'
		}
	}));
	row.children[1].add(Ti.UI.createLabel({
		text : 'Nodes::total: ' + nodes.nodestotal.total,
		top : 0,
		left : 0,
		textAlign : 'left',
		width : Ti.UI.FILL,
		color : 'gray',
		font : {
			fontSize : 14,
			fontFamily : 'Roboto Condensed'
		}
	}));
	nodes.nodestotal.online && row.children[1].add(Ti.UI.createLabel({
		text : 'Nodes::online: ' + nodes.nodestotal.online,
		top : 0,
		left : 0,
		textAlign : 'left',
		width : Ti.UI.FILL,
		color : 'gray',
		font : {
			fontSize : 14,
			fontFamily : 'Roboto Condensed'
		}
	}));
	nodes.nodestotal.offline && row.children[1].add(Ti.UI.createLabel({
		text : 'nodes::offline: ' + nodes.nodestotal.offline,
		top : 0,
		left : 0,
		textAlign : 'left',
		width : Ti.UI.FILL,
		color : 'gray',
		font : {
			fontSize : 14,
			fontFamily : 'Roboto Condensed'
		}
	}));
	row.children[1].add(Ti.UI.createLabel({
		text : 'Size: ' + (nodes.filesize/1024).toFixed() + ' kBytes',
		top : 0,
		left : 0,
		textAlign : 'left',
		width : Ti.UI.FILL,
		color : 'gray',
		font : {
			fontSize : 14,
			fontFamily : 'Roboto Condensed'
		}
	}));
	row.children[1].add(Ti.UI.createLabel({
		text : 'Transfertime: ' + (nodes.transfertime/1000).toFixed(1) + ' sec.',
		top : 0,
		left : 0,
		textAlign : 'left',
		width : Ti.UI.FILL,
		color : 'gray',
		font : {
			fontSize : 14,
			fontFamily : 'Roboto Condensed'
		}
	}));
	row.children[1].add(Ti.UI.createLabel({
		text : 'Transferspeed: ' + (nodes.filesize/nodes.transfertime).toFixed(1) + ' KB/s',
		top : 0,
		left : 0,
		textAlign : 'left',
		width : Ti.UI.FILL,
		color : 'gray',
		font : {
			fontSize : 14,
			fontFamily : 'Roboto Condensed'
		}
	}));
	row.children[1].add(Ti.UI.createLabel({
		text : 'Parsetime: ' + nodes.parsetime + ' ms',
		top : 0,
		left : 0,
		textAlign : 'left',
		width : Ti.UI.FILL,
		color : 'gray',
		font : {
			fontSize : 14,
			fontFamily : 'Roboto Condensed'
		}
	}));
	return row;
};
