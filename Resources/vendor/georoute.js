/**
 * Author: Rainer Schleevoigt
 * Please see the LICENSE included with this distribution for details.
 */

if (Number.prototype.toDegrees === undefined) {
	Number.prototype.toDegrees = function() {
		return this * 180 / Math.PI;
	};
}
if (Number.prototype.toRadians === undefined) {
	Number.prototype.toRadians = function() {
		return this * Math.PI / 180;
	};
}

var Module = function() {
	this.eventhandlers = [];
	return this;
};
Module.prototype = {
	compassPoint : function(bearing, precision) {
		if (precision === undefined)
			precision = 3;
		// note precision = max length of compass point; it could be extended to 4 for quarter-winds
		// (eg NEbN), but I think they are little used

		bearing = ((bearing % 360) + 360) % 360;
		// normalise to 0..360

		var point;

		switch (precision) {
		case 1:
			// 4 compass points
			switch (Math.round(bearing*4/360)%4) {
			case 0:
				point = 'N';
				break;
			case 1:
				point = 'E';
				break;
			case 2:
				point = 'S';
				break;
			case 3:
				point = 'W';
				break;
			}
			break;
		case 2:
			// 8 compass points
			switch (Math.round(bearing*8/360)%8) {
			case 0:
				point = 'N';
				break;
			case 1:
				point = 'NE';
				break;
			case 2:
				point = 'E';
				break;
			case 3:
				point = 'SE';
				break;
			case 4:
				point = 'S';
				break;
			case 5:
				point = 'SW';
				break;
			case 6:
				point = 'W';
				break;
			case 7:
				point = 'NW';
				break;
			}
			break;
		case 3:
			// 16 compass points
			switch (Math.round(bearing*16/360)%16) {
			case  0:
				point = 'N';
				break;
			case  1:
				point = 'NNE';
				break;
			case  2:
				point = 'NE';
				break;
			case  3:
				point = 'ENE';
				break;
			case  4:
				point = 'E';
				break;
			case  5:
				point = 'ESE';
				break;
			case  6:
				point = 'SE';
				break;
			case  7:
				point = 'SSE';
				break;
			case  8:
				point = 'S';
				break;
			case  9:
				point = 'SSW';
				break;
			case 10:
				point = 'SW';
				break;
			case 11:
				point = 'WSW';
				break;
			case 12:
				point = 'W';
				break;
			case 13:
				point = 'WNW';
				break;
			case 14:
				point = 'NW';
				break;
			case 15:
				point = 'NNW';
				break;
			}
			break;
		default:
			throw console.log('Precision must be between 1 and 3');
		}

		return point;
	},

	getDistBearing : function(φ1, λ1, φ2, λ2) {
		const π = Math.PI,
		    R = 6371000;
		// distance :
		var φ1 = φ1.toRadians();
		var φ2 = φ2.toRadians();
		var Δφ = (φ2 - φ1).toRadians();
		var Δλ = (λ2 - λ1).toRadians();
		var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		// bearing :
		var y = Math.sin(λ2 - λ1) * Math.cos(φ2);
		var x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
		return {
			bearing : Math.atan2(y, x).toDegrees(),
			distance : R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
		};
	},
	getLocation : function() {
		var args = arguments[0] || {};
		var that = this;
		if (Ti.Geolocation.locationServicesEnabled) {
			Ti.Geolocation.purpose = args.purpose || 'Deine Position für Routingberechnung';
			Ti.Geolocation.getCurrentPosition(function(e) {
				if (e.error) {
					Ti.API.error('Error: ' + e.error);
					console.log(e.error);
					Ti.App.Properties.removeProperty('lastGeolocation');
				} else {
					console.log('Position found');
					console.log(JSON.stringify(e.coords));
					Ti.App.Properties.setString('lastGeolocation', JSON.stringify(e.coords));
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
		var url = 'https://maps.googleapis.com/maps/api/directions/json?language=' + Ti.Locale.getCurrentLanguage() + '&mode=' + Ti.App.Properties.getString('MODE', 'walking') + '&origin=' + foo.latitude + ',' + foo.longitude + '&destination=' + address + '&sensor=false';
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

exports.createGeo = function() {
	return new Module();
};
