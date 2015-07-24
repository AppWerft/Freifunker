if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}
var GeoTools = require('vendor/geotools');

var url = 'https://map.hamburg.freifunk.net/nodes.json';

function calcRegion(nodes) {
	var lats = 0,
	    lons = 0,
	    minlat = maxlat = parseFloat(nodes[0].lat),
	    minlon = maxlon = parseFloat(nodes[0].lon);
	total = 0;
	nodes.forEach(function(n) {
		var lat = parseFloat(n.lat);
		var lon = parseFloat(n.lon);
		if (n.reldist < 10) {
			lats += lat;
			lons += lon;
			minlat = Math.min(minlat, lat);
			maxlat = Math.max(maxlat, lat);
			minlon = Math.min(minlon, lon);
			maxlon = Math.max(maxlon, lon);
			total++;
		}
	});
	return {
		latitude : lats / total,
		longitude : lons / total,
		latitudeDelta : 1.44 * (maxlat - minlat),
		longitudeDelta : 1.44 * (maxlon - minlon)
	};
}

var FFModule = function() {
	this.eventhandlers = {};
	return this;
};

FFModule.prototype = {
	loadNodes : function() {
		var args = arguments[0] || {};
		var xhr = Ti.Network.createHTTPClient({
			timeout : 30000,
			onload : function() {
				var allnodes = [];
				/// XML:
				// beginnt mit optionalem Leerzeichen und '<'
				if (this.responseText.match(/^\s*</mg)) {
					console.log('PARSERINFO: XML found');
					var data = (new (require('vendor/XMLTools'))(this.responseXML)).toObject();
					console.log(data);
					if (data.node) {//Berlin
						console.log('PARSERINFO: has property node');
						var allnodes = data.node.map(function(node) {
							return {
								id : node.nodeid,
								lat : node.lat,
								lon : node.lon,
								name : node.name
							};
						});
					} else if (data.routerlist) { 
						console.log('  found');
						console.log(data.routerlist);

					} else {// Leipzig
						console.log('PARSERINFO: has property marker');
						var allnodes = data.marker.map(function(node) {
							return {
								id : node.id,
								lat : node.lat,
								lon : node.lng,
								name : node.title
							};
						});
					}
				} else {
					// J S O N
					var json = JSON.parse(this.responseText);
					console.log('PARSERINFO: JSON');
					if (json.features) {// Rostock
						console.log('PARSERINFO: has property features');
						json.features.forEach(function(feature) {
							allnodes.push({
								lat : feature.geometry.coordinates[1],
								lon : feature.geometry.coordinates[0],
								id : feature.properties.id,
								name : feature.properties.id.replace('192.168.', 'OpenNet ')
							});
						});
					} else if (json.topo) {// Halle
						console.log('PARSERINFO: has property topo');
						Object.getOwnPropertyNames(json.topo).forEach(function(key) {
							allnodes.push({
								lat : json.topo[key].latitude,
								lon : json.topo[key].longitude,
								id : key,
								name : json.topo[key].hostname
							});
						});
					} else if (json.rows) {
						console.log('PARSERINFO: has property rows');
						var allnodes = json.rows.map(function(row) {
							return {
								name : row.value.hostname,
								lat : (row.value.latlng) ? row.value.latlng[0] : row.value.lat,
								lon : (row.value.latlng) ? row.value.latlng[1] : row.value.lon,
								id : row.id
							};
						});
					} else if (json.nodes) {// Bremen
						console.log('PARSERINFO: has property nodes => we must decide if array or object');
						var nodes = json.nodes;
						if (Object.prototype.toString.call(nodes) === '[object Array]') {
							console.log('PARSERINFO: has property node array');
							if (nodes[0].network || nodes[0].hostname) {// Bremen
								console.log('PARSERINFO: node has property statistics');
								nodes.forEach(function(node) {
									if (node.location && node.location.latitude && node.location.longitude) {
										allnodes.push({
											lat : node.location.latitude,
											lon : node.location.longitude,
											id : node.network.node_id,
											name : node.hostname,
											clients : node.statistics.clients,
											online : node.flags.online
										});

									}
								});
							} else if (nodes[0].lat) {
								allnodes = nodes.map(function(loc) {
									return {
										lat : loc.lat,
										lon : loc.lon,
										id : loc.id,
										name : '#' + loc.id
									};
								});
							} else {
								allnodes = nodes.filter(function(n) {
									return (n.geo || n.position) ? true : false;
								});
								allnodes = allnodes.map(function(loc) {
									return {
										lat : loc.geo ? loc.geo[0] : loc.position.lat,
										lon : loc.geo ? loc.geo[1] : loc.position.long,
										id : loc.id,
										name : loc.name,
										online : (loc.flags) ? loc.flags.online : undefined,
										clients : loc.clientcount
									};
								});
							}
						} else {
							Object.getOwnPropertyNames(nodes).forEach(function(key) {
								var node = nodes[key];
								node.nodeinfo && node.nodeinfo.location && allnodes.push({
									name : node.nodeinfo.hostname,
									lat : node.nodeinfo.location.latitude,
									lon : node.nodeinfo.location.longitude,
									id : key,
									online : node.flags && node.flags.online,
									clients : node.statistics && node.statistics.clients
								});
							});
						}
					}
				}
				console.log('Allnodes=' + allnodes.length);
				var nodes = allnodes.filter(function(n) {
					return (n.lat > 30 && n.lat < 70 && n.lon > 4 && n.lon < 20);
				});
				console.log('nodes=' + nodes.length);
				var center = GeoTools.getPolygonCenter(nodes);
				console.log('CENTER = ' + JSON.stringify(center));
				var avgdist = 0;
				nodes.forEach(function(n) {
					n.dist = GeoTools.distance(n.lat, n.lon, center.lat, center.lon);
					avgdist += (n.dist / nodes.length);
				});
				console.log('AVGdistance=' + avgdist);
				nodes.forEach(function(n) {
					n.reldist = n.dist / avgdist;
				});
				args.done && args.done({
					nodes : nodes,
					region : calcRegion(nodes)
				});
			},
			onerror : function() {
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
