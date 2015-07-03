var url = 'https://map.hamburg.freifunk.net/nodes.json';

var Module = function(args) {
    this.eventhandlers = {};
    return this;
};

Module.prototype = {
    loadNodes : function(done) {
        var args = arguments[0] || {};
        var xhr = Ti.Network.createHTTPClient({
            timeout : 30000,
            onload : function() {
                var nodesobj = JSON.parse(this.responseText).nodes;
                var nodes = [];
                Object.getOwnPropertyNames(nodesobj).forEach(function(key) {
                    nodesobj[key].nodeinfo.location && nodes.push({
                        hostname : nodesobj[key].nodeinfo.hostname,
                        location : nodesobj[key].nodeinfo.location,
                        lastseen : nodesobj[key].flags.lastseen,
                        firstseen : nodesobj[key].flags.firstseen,
                        model : nodesobj[key].nodeinfo.hardware.model,
                        id : key,
                        statistics : nodesobj[key].statistics
                    });
                });
                args.done && args.done(nodes);
            }
        });
        xhr.open('GET', url);
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
