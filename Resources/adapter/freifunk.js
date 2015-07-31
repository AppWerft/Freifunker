const DBNAME = "FREIFUNK";

var GeoTools = require('vendor/geotools');
var GeoRoute = require('vendor/georoute').createGeo();

var url = 'https://map.hamburg.freifunk.net/nodes.json';

var FFModule = function() {
	this.eventhandlers = {};
	var link = Ti.Database.open(DBNAME);
	link.execute('CREATE TABLE IF NOT EXISTS nodes (nodeid TEXT UNIQUE,id TEXT,community TEXT,lat NUMBER,lon NUMBER, name TEXT, json TEXT, mtime NUMBER,address TEXT)');
	link.execute('CREATE INDEX IF NOT EXISTS communityindex ON nodes (community)');
	link.close();
	return this;
};

FFModule.prototype = {
	getNodesTotal : function() {
		var total = 0;
		var link = Ti.Database.open(DBNAME);
		var res = link.execute('SELECT COUNT(*) AS total FROM nodes');
		if (res.isValidRow())
			total = res.fieldByName('total');
		res.close();
		link.close();
		return total;
	},
	getNodes : function() {
		var radius = 10 / 40000 * 360;
		// 10 km
		if (!Ti.App.Properties.hasProperty('lastGeolocation'))
			return [];
		var coords = JSON.parse(Ti.App.Properties.getString('lastGeolocation'));
		var nodes = [];
		var DomainList = new (require('adapter/domainlist'))();
		var domainlist = DomainList.getList();
		var logo = '';
		var link = Ti.Database.open(DBNAME);
		var sql = 'SELECT * FROM nodes WHERE lat>' + (coords.latitude - radius) + ' AND lat<' + (coords.latitude + radius) + ' AND lon>' + (coords.longitude - radius) + ' AND lon<' + (coords.longitude + radius);
		var res = link.execute(sql);
		while (res.isValidRow()) {
			var community = res.fieldByName('community');
			domainlist.forEach(function(domain) {
				if (domain.name == community)
					logo = domain.image;
			});
			var geo = GeoRoute.getDistBearing(coords.latitude, coords.longitude, res.fieldByName('lat'), res.fieldByName('lon'));
			nodes.push({
				nodeid : res.fieldByName('nodeid'),
				id : res.fieldByName('id'),
				community : community,
				lat : res.fieldByName('lat'),
				lon : res.fieldByName('lon'),
				distance : Math.round(geo.distance),
				bearing : Math.round(geo.bearing),
				name : res.fieldByName('name'),
				logo : logo,
				compassPoint : GeoRoute.compassPoint(geo.bearing, 2),
				id : res.fieldByName('id')
			});
			res.next();
		}
		nodes.sort(function(a, b) {
			return a.distance > b.distance ? 1 : -1;
		});
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
				var link = Ti.Database.open(DBNAME);
				link.execute('BEGIN TRANSACTION');
				res.nodes.forEach(function(node, i) {
					link.execute("INSERT OR REPLACE INTO nodes VALUES (?,?,?,?,?,?,?,?,?)", Ti.Utils.md5HexDigest(node.id + args.name), node.id, args.name, parseFloat(node.lat), parseFloat(node.lon), node.name, JSON.stringify(node), new Date().getTime(), '');
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
