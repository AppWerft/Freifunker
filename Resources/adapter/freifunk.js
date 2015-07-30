if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}
var GeoTools = require('vendor/geotools');

var url = 'https://map.hamburg.freifunk.net/nodes.json';

var FFModule = function() {
	this.eventhandlers = {};
	var link = Ti.Database.open('FF');
	link.execute('CREATE TABLE IF NOT EXISTS nodes (nodeid TEXT,id TEXT,community TEXT,lat NUMBER,lon NUMBER, name TEXT, json TEXT, mtime NUMBER)');
	link.execute('CREATE INDEX IF NOT EXISTS communityindex ON nodes (community)');
	link.close();
	return this;
};

FFModule.prototype = {
	getNodes : function() {
		var nodes = [];
		var link = Ti.Database.open('FF');
		var res = link.execute('SELECT * FROM nodes');
		while (res.isValidRow()) {
			nodes.push({
				nodeid : res.fieldByName('nodeid'),
				id : res.fieldByName('id'),
				community : res.fieldByName('community'),
				lat : res.fieldByName('lat'),
				lon : res.fieldByName('lon'),
				name: res.fieldByName('name'),
				id : res.fieldByName('id')
			});
			res.next();
		}
		res.close();
		link.close();
		return nodes;
	},
	loadNodes : function() {
		var args = arguments[0] || {};
		if (!Ti.Network.online) {
			args.done && args.done(Ti.App.Properties.getObject(args.name), null);
			return;
		}
		var start = new Date().getTime();
		var xhr = Ti.Network.createHTTPClient({
			timeout : 30000,
			onload : function() {
				this.start = start;
				var res = require('adapter/freifunk.parser')(this);
				args.done && args.done(res);
				Ti.App.Properties.setObject(args.name, res);
				// Caching
				/* now for offline list: */
				var link = Ti.Database.open('FF');
				link.execute('BEGIN TRANSACTION');
				res.nodes.forEach(function(node,i) {
					link.execute("INSERT OR REPLACE INTO nodes VALUES (?,?,?,?,?,?,?,?)", Ti.Utils.md5HexDigest(node.id + args.name), node.id, args.name, parseFloat(node.lat), parseFloat(node.lon), node.name, JSON.stringify(node), new Date().getTime());
				});
				link.execute('COMMIT');
				link.close();
			},
			onerror : function() {
				if (Ti.App.Properties.hasProperty(args.name)) {
					args.done && args.done(Ti.App.Properties.getString(args.name, null));
				}
				args.done && args.done(null);
			}
		});
		xhr.open('GET', args.url);
		xhr.setRequestHeader('Accept', 'text/javascript, application/javascript,application/xml');
		xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:37.0) Gecko/20100101 Firefox/37.0');
		xhr.send();
	},
	fireEvent : function(_event, _payload) {
		if (this.eventhandlers[_event]) {
			for (var i = 0; i < this.eventhandlers[_event].length; i++) {
				this.eventhandlers[_event][i].call(this, _payload);
			}
		}
	},
	addEventListener : function(_event, _callback) {
		if (!this.eventhandlers[_event])
			this.eventhandlers[_event] = [];
		this.eventhandlers[_event].push(_callback);
	},
	removeEventListener : function(_event, _callback) {
		if (!this.eventhandlers[_event])
			return;
		var newArray = this.eventhandlers[_event].filter(function(element) {
			return element != _callback;
		});
		this.eventhandlers[_event] = newArray;
	}
};
module.exports = FFModule;