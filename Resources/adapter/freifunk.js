if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

var url = 'https://map.hamburg.freifunk.net/nodes.json';

function calcRegion(nodes) {
	var lats = 0,
	    lngs = 0,
	    total = 0;
	nodes.forEach(function(n) {
		var lat = parseFloat(n.geo[0]);
		var lng = parseFloat(n.geo[1]);
		if (lat > 10 && lat < 70 && lng > 2 && lng < 20) {
			lats += lat;
			lngs += lng;
			total++;
		}
	});
	return {
		latitude : lats / total,
		longitude : lngs / total,
		latitudeDelta : 1,
		longitudeDelta : 1
	};
}

var Module = function(args) {
	this.eventhandlers = {};
	return this;
};

Module.prototype = {
	loadNodes : function() {
		var args = arguments[0] || {};
		var xhr = Ti.Network.createHTTPClient({
			timeout : 30000,
			onload : function() {
				var barnodes = [];
				var nodes = JSON.parse(this.responseText).nodes;
				if (Object.prototype.toString.call(nodes) === '[object Array]') {
					barnodes = nodes.filter(function(n) {
						return n.geo ? true : false;
					});
					args.done && args.done({
						nodes : barnodes,
						region : calcRegion(barnodes)
					});
				} else {
					Object.getOwnPropertyNames(nodes).forEach(function(key) {
						var node = nodes[key];
						node.nodeinfo.location && barnodes.push({
							name : node.nodeinfo.hostname,
							geo : [node.nodeinfo.location.latitude, node.nodeinfo.location.longitude],
							//	lastseen : node.flags.lastseen,
							//	firstseen : node.flags.firstseen,
							//	model : node.nodeinfo.hardware.model,
							id : key,
							//	statistics : node.statistics
						});
					});
					args.done && args.done({
						nodes : barnodes,
						region : calcRegion(barnodes)
					});
				}
			}
		});
		xhr.open('GET', args.url);
		xhr.setRequestHeader('Accept', 'text/javascript, application/javascript');
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

module.exports = Module;
