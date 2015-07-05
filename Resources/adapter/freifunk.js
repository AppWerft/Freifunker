if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

var url = 'https://map.hamburg.freifunk.net/nodes.json';

function calcCenter(nodes) {
	var lats = 0,
	    lngs = 0;
	nodes.forEach(function(n) {
		lats += (parseFloat(n.geo[0] / nodes.length));
		lngs += (parseFloat(n.geo[1] / nodes.length));
	});
	return [lats, lngs];
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
						center : calcCenter(barnodes)
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
						center : calcCenter(barnodes)
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
