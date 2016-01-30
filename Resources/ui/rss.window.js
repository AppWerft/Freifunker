var Moment = require('vendor/moment');
Moment.locale('de');

var Map = require('ti.map');

module.exports = function() {
	var self = Ti.UI.createWindow({
		fullscreen : false,
		backgroundColor : '#F9EABA',
		orientationModes : []
	});
	var listview = Ti.UI.createListView({
		height : Ti.UI.FILL,
		top : 74,
		sections : [Ti.UI.createListSection()],
		templates : {
			'feed' : require('ui/TEMPLATES').feed,
		},
		defaultItemTemplate : 'feed',

	});
	self.add(listview);
	listview.addEventListener('itemclick', function(_e) {
		var options = JSON.parse(_e.itemId);
		var win = Ti.UI.createWindow({
			title : options.title,
			backgroundColor : '#F9EABA',
			spinner : Ti.UI.createActivityIndicator({
				height : Ti.UI.SIZE,
				width : Ti.UI.SIZE,
				visible : true,
				zIndex : 999,
				style : (Ti.Platform.name === 'iPhone OS') ? Ti.UI.iPhone.ActivityIndicatorStyle.BIG : Ti.UI.ActivityIndicatorStyle.BIG
			})
		});
		console.log(options);
		var web = Ti.UI.createWebView({
			top : 74,
			touchEnabled : true,
			disableBounce : true,
			scalesPageToFit : true,
			enableZoomControls : false,
			willHandleTouches : false,
			borderRadius : 1,
			disableBounce : true,
			url : options.link,
		});
		web.addEventListener('load', function() {
			win.spinner.hide();
			win.remove(win.spinner);
		});
		win.add(web);
		win.add(win.spinner);
		win.addEventListener('open', require('ui/web.actionbar'));
		win.open();
	});
	require('adapter/feed')({
		done : function(_result) {
			listview.sections[0] && listview.sections[0].setItems(_result.feed.map(function(_item) {
				return {
					properties : {
						itemId : JSON.stringify({
							link : _item.link,
							title : _item.title,
							pubdate : _item.pubDate
						}),
						accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
					},
					description : {
						html : _item.description
					},
					title : {
						text : _item.title
					}
				};
			}));
		}
	});

	Ti.Android && self.addEventListener('open', require('ui/rss.actionbar'));
	return self;
};
