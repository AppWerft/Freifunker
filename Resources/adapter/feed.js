var url = "http://freifunk.net/fffeed/feed.php";

module.exports = function(_args) {
	var xhr = Ti.Network.createHTTPClient({
		timeout : 30000,
		onload : function() {
			var xml = new (require('vendor/XMLTools'))(this.responseXML);
			console.log(xml.toObject().feed);
			var feed = xml.toObject().channel.item.map(function(i) {
				return {
					description : i.description,
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
