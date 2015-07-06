var Moment = require('vendor/moment');
Moment.locale('de');

var Map = require('ti.map');

module.exports = function() {
	var self = Ti.UI.createWindow({
		fullscreen : false,
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
	require('adapter/feed')({
		done : function(_result) {
			listview.sections[0].setItems(_result.feed.map(function(_item) {
				return {
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
