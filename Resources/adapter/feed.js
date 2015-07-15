var url = "http://freifunk.net/fffeed/feed.php";

module.exports = function(_args) {
	if (!Ti.App.Properties.hasProperty('FEED'))
		Ti.UI.createNotification({
			duration : 5000,
			message : 'Das kann jetzt dauern.'
		}).show();
	var xhr = Ti.Network.createHTTPClient({
		timeout : 120000,
		onerror : function() {
			Ti.UI.createNotification({
				duration : 10000,
				message : 'Feedserver antwortet leider gerade nicht.\nVielleicht später wieder …'
			}).show();
		},
		onload : function() {
			var xml = new (require('vendor/XMLTools'))(this.responseXML);
			var feed = xml.toObject().channel.item.map(function(i) {
				var description = i.description//
				.replace(/&gt;/gim, '>')//
				.replace(/&lt;/gim, '<')//
				.replace(/<p>/gim, '\n')//
				.replace(/(<([^>]+)>)/ig, "")// striptags
				.replace(/\sweiterlesen\s/g, '');
				return {
					description : description,
					title : i.title,
					link : i.link
				};
			});
			Ti.App.Properties.setList('FEED', feed);
			_args.done && _args.done({
				feed : feed
			});
		}
	});
	xhr.open('GET', url);
	xhr.send();
	if (Ti.App.Properties.hasProperty('FEED')) {
		_args.done && _args.done({
			feed : Ti.App.Properties.getList('FEED')
		});
	}
};
