const DBNAME = "FREIFUNK";

var GeoTools = require('vendor/geotools');
var GeoRoute = require('vendor/georoute').createGeo();
var ActionBar = require('com.alcoapps.actionbarextras');
var url = 'https://map.hamburg.freifunk.net/nodes.json';

var FFModule = function() {
	this.eventhandlers = {};
	var link = Ti.Database.open(DBNAME);
	link.execute('CREATE TABLE IF NOT EXISTS nodes (nodeid TEXT UNIQUE, id TEXT,community TEXT,lat NUMBER,lon NUMBER, name TEXT, json TEXT, mtime NUMBER,address TEXT)');
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
	setAddress : function(nodeid, address) {
		console.log(nodeid + ' ' + address);
		var link = Ti.Database.open(DBNAME);
		var res = link.execute('UPDATE nodes SET address=? WHERE nodeid=?', address, nodeid);
		console.log(res);
		link.close();
	},
	getNodes : function(_cb) {
		GeoRoute.getLocation();
		function update(args) {

			var radius = 1000 / 40000000 * 360;
			// 10 km
			if (!Ti.App.Properties.hasProperty('lastGeolocation') && !args)
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
					address : res.fieldByName('address'),
					distance : Math.round(geo.distance),
					bearing : Math.round(geo.bearing),
					name : res.fieldByName('name'),
					logo : logo,
					compassPoint : GeoRoute.compassPoint(geo.bearing, 2)
				});
				res.next();
			}
			res.close();
			link.close();
			nodes.sort(function(a, b) {
				return a.distance > b.distance ? 1 : -1;
			});

			_cb(nodes);
		}


		GeoRoute.addEventListener('position', function(_res) {
			GeoRoute.removeEventListener('position', update);
			Ti.UI.createNotification({
				message : 'Standortgenauigkeit: ' + Math.round(_res.coords.accuracy) + ' m'
			}).show();
			GeoRoute.getAddress(_res.coords, function(_res) {
				ActionBar.setSubtitle(_res.street + ' ' + _res.street_number);
				Ti.UI.createNotification({
					message : 'Dein ungefährer Standort:\n' + _res.street + ' ' + _res.street_number
				}).show();
			});
			update(_res);
		});
		update();
	},
	pingNodes : function() {
		var args = arguments[0] || {};
		if (!Ti.Network.online) {
			args.done && args.done(Ti.App.Properties.getObject(args.name), null);
			return;
		}
		var start = new Date().getTime();
		var xhr = Ti.Network.createHTTPClient({
			validatesSecureCertificate : false,
			timeout : args.timeout || 30000,
			onload : function() {
				var end = new Date().getTime();
				var res = {
					response : this.getAllResponseHeaders(),
					time : end - start
				};
				args.done && args.done(res);
			},
			onerror : function() {
				args.done && args.done(null);
			}
		});
		xhr.open('HEAD', args.url);
		xhr.send(null);
		var start = new Date().getTime();
		var that = this;
		var onProgress = function() {
			if (that.tick == that.timeout) {
				that.tick = 0;
				clearInterval(that.cron);
			}
			that.tick += 1000;
			args.progress && args.progress(that.tick / args.timeout);
		};
		this.tick = 0;
		this.cron = setInterval(onProgress, 1000);
	},

	loadNodes : function() {
		var args = arguments[0] || {};
		if (Ti.Network.online == false) {
			args.done && args.done(Ti.App.Properties.getObject(args.name), null);
			return;
		}
		var start = new Date().getTime();
		var xhr = Ti.Network.createHTTPClient({
			timeout : 30000,
			validatesSecureCertificate : false,
			onload : function() {
				this.start = start;
				var res = require('adapter/freifunk.parser')(this);
				Ti.App.Properties.setObject(args.name, res);
				args.done && args.done(res);
				Ti.App.Properties.setObject('NODE_' + args.name, res);
				// Caching
				/* now for offline list: */
				console.log('DBNAME=' + DBNAME);
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
					args.done && args.done(Ti.App.Properties.getObject('NODE_' + args.name, null));
				}
				args.done && args.done(null);
			}
		});
		xhr.open('GET', args.url);
		xhr.setRequestHeader('Accept', 'text/javascript, application/javascript,application/xml');
		xhr.setRequestHeader('Accept-Encoding', 'gzip, deflate');
		xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (FreiFunkApp) Gecko/20100101 Firefox/37.0');
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
