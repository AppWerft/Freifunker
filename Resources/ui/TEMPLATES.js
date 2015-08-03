exports.feed = {
	properties : {
		height : Ti.UI.SIZE,
		backgroundColor : 'white',
		itemId : ''
	},
	childTemplates : [{
		type : 'Ti.UI.Label',
		bindId : 'start',
		properties : {
			left : 5,
			touchEnabled : false,
			top : 5,
			color : '#777',
			font : {
				fontSize : 22,
				fontFamily : 'Aller'
			},
		}
	}, {
		type : 'Ti.UI.View',
		properties : {
			width : Ti.UI.FILL,
			layout : 'vertical',
			left : 10,
			bottom : 10,
			top : 0,
			height : Ti.UI.SIZE,
			right : 25
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'title',
			properties : {
				top : 5,
				font : {
					fontSize : 22,
					fontFamily : 'Roboto Condensed'
				},
				color : '#444',
				left : 0,
				width : Ti.UI.FILL,
			}

		}, {
			type : 'Ti.UI.Label',
			bindId : 'description',
			properties : {
				left : 0,
				top : 0,
				html : '',
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 16,
				},
				color : '#333'
			}
		}]
	}]
};

exports.node = {
	properties : {
		height : Ti.UI.SIZE,
		backgroundColor : 'white',
	},
	childTemplates : [{
		type : 'Ti.UI.ImageView',
		bindId : 'logo',
		properties : {
			left : 5,
			touchEnabled : false,
			top : 5,
			width : 80,
			height : 70,
			defaultImage : '/images/ff.png'
		}
	}, {
		type : 'Ti.UI.Label',
		bindId : 'arrow',
		properties : {
			left : 36,
			touchEnabled : false,
			top : 40,
			color:'#DA1068',
			width : Ti.UI.SIZE,
			height : 0,
			text : '︎',
			font : {
				fontSize : 60
			}
		}
	}, {
		type : 'Ti.UI.View',
		properties : {
			width : Ti.UI.FILL,
			layout : 'vertical',
			left : 100,
			top : 0,
			bottom : 5,
			height : Ti.UI.SIZE,
			right : 25
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'name',
			properties : {
				top : 5,
				font : {
					fontSize : 22,
					fontFamily : 'Roboto Condensed'
				},
				color : '#DA1068',
				left : 0,
				textAlign : 'left',
				width : Ti.UI.FILL,
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'distance',
			properties : {
				left : 0,
				top : 5,
				textAlign : 'left',
				text : '',
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 14,
					fontFamily : 'Roboto Condensed'
				},
				color : '#fc3'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'bearing',
			properties : {
				left : 0,
				top : 0,
				text : '',
				textAlign : 'left',
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 14,
					fontFamily : 'Roboto Condensed'
				},
				color : '#fc3'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'address',
			properties : {
				left : 0,
				top : 0,
				textAlign : 'left',
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 16,
					fontFamily : 'Roboto Condensed'
				},
				color : 'transparent'
			}
		}]
	}]
};
