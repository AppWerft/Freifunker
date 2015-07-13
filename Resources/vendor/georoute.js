/**
 * Author: Rainer Schleevoigt
 * Please see the LICENSE included with this distribution for details.
 */

var Module = function() {
    this.eventhandlers = [];
    return this;
};
Module.prototype = {
    getLocation : function() {
        var args = arguments[0] || {};
        var that = this;
        if (Ti.Geolocation.locationServicesEnabled) {
            Ti.Geolocation.purpose = args.purpose || 'Deine Position für Routingberechnung';
            Ti.Geolocation.getCurrentPosition(function(e) {
                if (e.error) {
                    Ti.API.error('Error: ' + e.error);
                    Ti.App.Properties.setString('lastGeolocation', JSON.stringify({
                        latitude : 53.553,
                        longitude : 10
                    }));

                } else {
                    console.log('Position found');
                    Ti.App.Properties.setString('lastGeolocation', JSON.stringify(e.coords));
                    that.coords = e.coords;
                    args.done && args.done({
                        coords : e.coords
                    });
                    that.fireEvent('position', {
                        coords : e.coords
                    });
                }
            });
        } else
            Ti.UI.createAlertDialog({
                message : 'Um alle Geofunktionen nutzen zu können, muss der Standortdienst eingeschaltet sein.',
                title : 'Standortdienst gestört …'
            }).show();
    },
    getLatLng : function(_address) {
        var that = this;
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?&sensor=true&address=' + encodeURIComponent(_address);
        console.log(url);
        xhr = Ti.Network.createHTTPClient();
        xhr.onload = function() {

            var res = JSON.parse(this.responseText);
            if (res.status == 'OK')
                that.fireEvent('latlng', res.results[0].geometry.location);

        };
        xhr.open('GET', url);
        xhr.send();
    },
    getAddress : function(_coords) {
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?&sensor=true&latlng=' + _coords.latitude + ',' + _coords.longitude;
        xhr = Ti.Network.createHTTPClient();
        xhr.onload = function() {
            try {
                var res = JSON.parse(this.responseText);
                res.results[0]['address_components'].forEach(function(part) {
                    //console.log(part);
                });
            } catch(E) {
                console.log('Warning: problem with google geocoding');
            }
        };
        xhr.open('GET', url);
        xhr.send();
    },
    getRoute : function(foo, address) {
        var that = this;
        var url = 'https://maps.googleapis.com/maps/api/directions/json?language=de&mode=' + Ti.App.Properties.getString('MODE', 'walking') + '&origin=' + foo.latitude + ',' + foo.longitude + '&destination=' + address + '&sensor=false';
        console.log(url);
        xhr = Ti.Network.createHTTPClient();
        xhr.onload = function() {
            //try {
                var res = JSON.parse(this.responseText);
                that.fireEvent('route', {
                    route : res.routes[0]
                });
            /*} catch(E) {
                console.log(E);
                console.log('Warning: problem with google direction geocoding');
            }*/
        };
        xhr.open('GET', url);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
    },
    // standard methods for event/observer pattern
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
