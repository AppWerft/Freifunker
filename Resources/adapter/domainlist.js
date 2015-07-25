var FFlist = function() {
	this.eventhandlers = {};
	//if (!Ti.App.Properties.hasProperty('DOMAINLIST')) {
		Ti.App.Properties.setList('DOMAINLIST', JSON.parse(Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'model', 'domainlist.json').read()));
	//}
	this.domainlist = Ti.App.Properties.getList('DOMAINLIST', []);
	return this;
};

FFlist.prototype = {
	getList : function() {
		return this.domainlist;
	},
	getActiveDomain : function() {
	},
	setActiveDomain : function() {
	},
	loadList : function() {
		var that = this;
		var xhr = Ti.Network.createHTTPClient({
			timeout : 30000,
			onload : function() {
				that.domainlist = JSON.parse(this.responseText);
				Ti.App.Properties.setList('DOMAINLIST', that.domainlist);
				that.fireEvent('load', {
					domainlist : that.domainlist
				});
			}
		});
		xhr.open('GET', 'https://raw.githubusercontent.com/AppWerft/Freifunker/master/Resources/model/domainlist.json');
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

module.exports = FFlist;
