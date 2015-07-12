if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

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
		if (lat > 10 && lat < 70 && lon > 2 && lon < 20) {
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
			timeout : 60000,
			onload : function() {
				var barnodes = [];
				/// XML:
				if (this.responseXML) {
					console.log('Info: XML found');
					var data = (new (require('vendor/XMLTools'))(this.responseXML)).toObject();
					if (data.node) {//Berlin
						var barnodes = data.node.map(function(node) {
							return {
								id : node.nodeid,
								lat : node.lat,
								lon : node.lon,
								name : node.name
							};
						});
					} else {// Leipzig
						var barnodes = data.marker.map(function(node) {
							return {
								id : node.id,
								lat : node.lat,
								lon : node.lng,
								name : node.title
							};
						});
					}
					args.done && args.done({
						nodes : barnodes,
						region : calcRegion(barnodes)
					});
				} else {
					// J S O N
					var json = JSON.parse(this.responseText);
					if (json.features) {// Rostock
						json.features.forEach(function(feature) {
							barnodes.push({
								lat : feature.geometry.coordinates[1],
								lon : feature.geometry.coordinates[0],
								id : feature.properties.id,
								name : feature.properties.id.replace('192.168', 'OpenNet ')
							});
						});
						args.done && args.done({
							nodes : barnodes,
							region : calcRegion(barnodes)
						});
					} else if (json.topo) {// Halle
						Object.getOwnPropertyNames(json.topo).forEach(function(key) {
							barnodes.push({
								lat : json.topo[key].latitude,
								lon : json.topo[key].longitude,
								id : key,
								name : json.topo[key].hostname
							});
						});
						args.done && args.done({
							nodes : barnodes,
							region : calcRegion(barnodes)
						});
					} else if (json.rows) {
						console.log('Info: rows detected');
						var barnodes = json.rows.map(function(row) {
							return {
								name : row.value.hostname,
								lat : (row.value.latlng) ? row.value.latlng[0] : row.value.lat,
								lon : (row.value.latlng) ? row.value.latlng[1] : row.value.lon,
								id : row.id
							};
						});
						args.done && args.done({
							nodes : barnodes,
							region : calcRegion(barnodes)
						});
					} else if (json.nodes) {
						var nodes = json.nodes;
						console.log('Info: JSON nodes detected');
						if (Object.prototype.toString.call(nodes) === '[object Array]') {
							if (nodes[0].owner && nodes[0].statistics) {// Bremen
								nodes.forEach(function(node) {
									if (node.location)
										barnodes.push({
											lat : node.location.latitude,
											lon : node.location.longitude,
											id : node.network.node_id,
											name : node.hostname,
											clients : node.statistics.clients,
											online : node.flags.online
										});
								});
							} else if (nodes[0].lat) {
								barnodes = nodes.map(function(loc) {
									return {
										lat : loc.lat,
										lon : loc.lon,
										id : loc.id,
										name : '#' + loc.id
									};
								});
							} else {
								barnodes = nodes.filter(function(n) {
									return (n.geo || n.position) ? true : false;
								});
								barnodes = barnodes.map(function(loc) {
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
							args.done && args.done({
								nodes : barnodes,
								region : calcRegion(barnodes)
							});
						} else {
							Object.getOwnPropertyNames(nodes).forEach(function(key) {
								var node = nodes[key];
								node.nodeinfo.location && barnodes.push({
									name : node.nodeinfo.hostname,
									lat : node.nodeinfo.location.latitude,
									lon : node.nodeinfo.location.longitude,
									id : key,
									online : node.flags && node.flags.online,
									clients : node.statistics && node.statistics.clients
								});
							});
							args.done && args.done({
								nodes : barnodes,
								region : calcRegion(barnodes)
							});
						}
					}
				}
			}
		});
		xhr.open('GET', args.url);
		console.log('URL' + args.url);
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
