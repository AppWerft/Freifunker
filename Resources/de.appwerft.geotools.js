if (!("toRadians" in Number.prototype)) {
	Number.prototype.toDegrees = function() {
		return this * 180 / Math.PI;
	};
};
if (!("toRadians" in Number.prototype)) {
	Number.prototype.toRadians = function() {
		return this * Math.PI / 180;
	};
};

var geonamesuser = Ti.App.Properties.hasProperty('geonamesuser') ? Ti.App.Properties.getString('geonamesuser') : 'demo';
var googleapikey = Ti.App.Properties.hasProperty('googleapikey') ? Ti.App.Properties.getString('googleapikey') : 'demo';

var Promise = require('org.favo.promise');

var TI_XML_ELEMENT_NODE = Ti.XML.Node.ELEMENT_NODE;


var parseAndRenderKML = function(xml, res) {
	console.log('>>>>>>>>>>>>');
	var start = new Date().getTime();
	var placemarklist = xml.getElementsByTagName("Placemark");
	var listItemCount = placemarklist.length;
	var childnodes;
	var placemark = {};
	var placemarkPoint;
	while (listItemCount) {
		childnodes = placemarklist.item(--listItemCount).getChildNodes();
	
		for (var node, nodename, i = 0,
		    len = childnodes.length; i < len; i++) {

			node = childnodes.item(i);
			nodename = node.getNodeName();
			if (nodename != '#text') {
				placemark[nodename] = node.getTextContent();
			}
		}
		if ( placemarkPoint = placemark.Point) {// assign and check [Point] property as it has been parsed right above.
			var coords = placemarkPoint.replace(/\s/g, '').split(',');
			placemark.latitude = parseFloat(coords[1], 10);
			placemark.longitude = parseFloat(coords[0], 10);
			delete placemark.Point;
			res.points.push(placemark);
		} else if (placemark.LineString !== undefined) {
			res.lines.push(placemark);
		} else if (placemark.Polygon !== undefined) {
			res.polygones.push(placemark);
		}
	}
	console.log('Info: KML parsingtime: ' + (new Date().getTime() - start));

};
/* Implementation of exported module */
var Module = {
	getPositionByIP : function(_ip) {
		var ip = _ip ? _ip : Ti.Platform.getAddress();
		var promise = Promise.defer();
		var xhr = Ti.Network.createHTTPClient({
			onload : function() {
				console.log(this.responseText);
				promise.resolve(JSON.parse(this.responseText));
			},
			onerror : function(_e) {
				console.log(_e);
				promise.reject(_e);
			}
		});
		xhr.open('GET', 'http://freegeoip.net/json/' + ip);
		console.log('http://freegeoip.net/json/' + ip);
		xhr.send();
		return promise;
	},
	getElevation : function() {
		var position = arguments[0] || {};
		var φ = Array.isArray(position) ? position[0] : position.lat || position.latitude;
		var λ = Array.isArray(position) ? position[1] : position.lng || position.lon || position.longitude;
		var promise = Promise.defer();
		var xhr = Ti.Network.createHTTPClient({
			onload : function() {
				promise.resolve(JSON.parse(this.responseText));
			},
			onerror : function(_e) {
				promise.reject(_e);
			}
		});
		xhr.open('POST', 'http://api.geonames.org/astergdemJSON?lat=' + φ + '&lng=' + λ + '&username=' + geonamesuser);
		xhr.send();
		return promise;
	},
	getRegionByCountry : function(_country) {
		var promise = Promise.defer();
		var country = _country || 'Deutschland';
		var xhr = Ti.Network.createHTTPClient({
			onload : function() {
				try {
					var json = JSON.parse(this.responseText);
					if (json.status == 'OK') {
						var result = json.results[0].geometry;
						var region = {
							latitude : result.location.lat,
							longitude : result.location.lng,
							latitudeDelta : Math.abs(result.viewport.northeast.lat - result.viewport.southwest.lat),
							longitudeDelta : Math.abs(result.viewport.northeast.lng - result.viewport.southwest.lng)
						};
						promise.resolve(region);
					}
				} catch (E) {
					promise.reject(E);
				}
			},
			onerror : function() {
				promise.reject(_e);
			}
		});
		xhr.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?address=' + country + '&sensor=false');
		xhr.send();
		return promise;
	},
	getRoute : function() {
		var promise = Promise.defer();
		/* helperfunction to decode googles polyline:*/
		var decodeLine = function(encoded) {
			var len = encoded.length;
			var index = 0;
			var array = [];
			var lat = 0;
			var lng = 0;
			while (index < len) {
				var b;
				var shift = 0;
				var result = 0;
				do {
					b = encoded.charCodeAt(index++) - 63;
					result |= (b & 0x1f) << shift;
					shift += 5;
				} while (b >= 0x20);
				var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
				lat += dlat;

				shift = 0;
				result = 0;
				do {
					b = encoded.charCodeAt(index++) - 63;
					result |= (b & 0x1f) << shift;
					shift += 5;
				} while (b >= 0x20);
				var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
				lng += dlng;
				array.push([lat * 1e-5, lng * 1e-5]);
			}
			var points = [];
			for (var i = 0; i < array.length; i++) {
				points.push({
					"latitude" : array[i][0],
					"longitude" : array[i][1]
				});
			}
			return points;
		};
		var source = arguments[0] || {};
		var destination = arguments[1] || {};
		var TYPE = arguments[2] || 'WALKING';
		var φ1 = Array.isArray(source) ? source[0] : source.lat || source.latitude;
		var λ1 = Array.isArray(source) ? source[1] : source.lng || source.lon || source.longitude;
		var φ2 = Array.isArray(destination) ? destination[0] : destination.lat || destination.latitude;
		var λ2 = Array.isArray(destination) ? destination[1] : destination.lng || destination.lon || destination.longitude;
		var client = Ti.Network.createHTTPClient({
			onload : function() {
				var route = JSON.parse(this.responseText).routes[0];
				if (route)
					promise.resolve({
						steps : route.legs[0].steps,
						meta : route.legs[0].distance.text + '\n' + route.legs[0].duration.text,
						"end_address" : route.legs[0]['end_address'],
						"start_address" : route.legs[0]['start_address'],
						region : {
							latitude : (route.bounds.northeast.lat + route.bounds.southwest.lat) / 2,
							longitude : (route.bounds.northeast.lng + route.bounds.southwest.lng) / 2,
							latitudeDelta : 1.2 * Math.abs(route.bounds.northeast.lat - route.bounds.southwest.lat),
							longitudeDelta : 1.2 * Math.abs(route.bounds.northeast.lng - route.bounds.southwest.lng)
						},

						route : decodeLine(route['overview_polyline'].points)
					});
				else
					promise.reject();
			}
		});
		var url = 'https://maps.googleapis.com/maps/api/directions/json?language=' + Ti.Locale.getCurrentLanguage() + '&sensor=false'//
		+ '&mode=' + TYPE// '
		+ '&origin=' + φ1 + ',' + λ1//
		+ '&destination=' + φ2 + ',' + λ2;
		client.open('GET', url);
		client.send();
		return promise;
	},
	loadKML : function() {
		var url = arguments[0];
		var promise = Promise.defer();
		var xhr = Ti.Network.createHTTPClient({
			onload : function() {
				var start = new Date().getTime();
				var res = {
					points : [],
					lines : [],
					polygons : [],
					statistics : null
				};
				parseAndRenderKML(this.responseXML.documentElement, res);

				promise.resolve(res);
			},
			onerror : function(_e) {
				promise.reject(_e);
			}
		});
		xhr.open('GET', url);
		xhr.send();
		return promise;
	},
	GaussKrueger2Geo : function() {

		/* Copyright (c) 2006, HELMUT H. HEIMEIER
		Permission is hereby granted, free of charge, to any person obtaining a
		copy of this software and associated documentation files (the "Software"),
		to deal in the Software without restriction, including without limitation
		the rights to use, copy, modify, merge, publish, distribute, sublicense,
		and/or sell copies of the Software, and to permit persons to whom the
		Software is furnished to do so, subject to the following conditions:
		The above copyright notice and this permission notice shall be included
		in all copies or substantial portions of the Software.*/

		/* Die Funktion wandelt GK Koordinaten in geographische Koordinaten
		um. Rechtswert rw und Hochwert hw müssen gegeben sein.
		Berechnet werden geographische Länge lp und Breite bp
		im Potsdam Datum.*/

		// Rechtswert rw und Hochwert hw im Potsdam Datum
		var args = arguments[0] || {};
		var rw = args.rw,
		    hw = args.hw;
		if (rw == "" || hw == "") {
			lp = "";
			bp = "";
			return;
		}
		rw = parseFloat(rw);
		hw = parseFloat(hw);

		//  Potsdam Datum
		// Große Halbachse a und Abplattung f
		a = 6377397.155;
		f = 3.34277321e-3;
		pi = Math.PI;

		// Polkrümmungshalbmesser c
		c = a / (1 - f);

		// Quadrat der zweiten numerischen Exzentrizität
		ex2 = (2 * f - f * f) / ((1 - f) * (1 - f));
		ex4 = ex2 * ex2;
		ex6 = ex4 * ex2;
		ex8 = ex4 * ex4;

		// Koeffizienten zur Berechnung der geographischen Breite aus gegebener
		// Meridianbogenlänge
		e0 = c * (pi / 180) * (1 - 3 * ex2 / 4 + 45 * ex4 / 64 - 175 * ex6 / 256 + 11025 * ex8 / 16384);
		f2 = (180 / pi) * (3 * ex2 / 8 - 3 * ex4 / 16 + 213 * ex6 / 2048 - 255 * ex8 / 4096);
		f4 = (180 / pi) * (21 * ex4 / 256 - 21 * ex6 / 256 + 533 * ex8 / 8192);
		f6 = (180 / pi) * (151 * ex6 / 6144 - 453 * ex8 / 12288);

		// Geographische Breite bf zur Meridianbogenlänge gf = hw
		sigma = hw / e0;
		sigmr = sigma * pi / 180;
		bf = sigma + f2 * Math.sin(2 * sigmr) + f4 * Math.sin(4 * sigmr) + f6 * Math.sin(6 * sigmr);

		// Breite bf in Radianten
		br = bf * pi / 180;
		tan1 = Math.tan(br);
		tan2 = tan1 * tan1;
		tan4 = tan2 * tan2;

		cos1 = Math.cos(br);
		cos2 = cos1 * cos1;

		etasq = ex2 * cos2;

		// Querkrümmungshalbmesser nd
		nd = c / Math.sqrt(1 + etasq);
		nd2 = nd * nd;
		nd4 = nd2 * nd2;
		nd6 = nd4 * nd2;
		nd3 = nd2 * nd;
		nd5 = nd4 * nd;

		//  Längendifferenz dl zum Bezugsmeridian lh
		kz = parseInt(rw / 1e6);
		lh = kz * 3;
		dy = rw - (kz * 1e6 + 500000);
		dy2 = dy * dy;
		dy4 = dy2 * dy2;
		dy3 = dy2 * dy;
		dy5 = dy4 * dy;
		dy6 = dy3 * dy3;

		b2 = -tan1 * (1 + etasq) / (2 * nd2);
		b4 = tan1 * (5 + 3 * tan2 + 6 * etasq * (1 - tan2)) / (24 * nd4);
		b6 = -tan1 * (61 + 90 * tan2 + 45 * tan4) / (720 * nd6);

		l1 = 1 / (nd * cos1);
		l3 = -(1 + 2 * tan2 + etasq) / (6 * nd3 * cos1);
		l5 = (5 + 28 * tan2 + 24 * tan4) / (120 * nd5 * cos1);

		// Geographischer Breite bp und Länge lp als Funktion von Rechts- und Hochwert
		bp = bf + (180 / pi) * (b2 * dy2 + b4 * dy4 + b6 * dy6);
		lp = lh + (180 / pi) * (l1 * dy + l3 * dy3 + l5 * dy5);

		if (lp < 5 || lp > 16 || bp < 46 || bp > 56) {
			lp = "";
			bp = "";
		}
		return {
			latitude : bp,
			longitude : lp
		};
	},
	UTM2Geo : function(zone, ew, nw) {
		/* Copyright (c) 2006, HELMUT H. HEIMEIER
		Permission is hereby granted, free of charge, to any person obtaining a
		copy of this software and associated documentation files (the "Software"),
		to deal in the Software without restriction, including without limitation
		the rights to use, copy, modify, merge, publish, distribute, sublicense,
		and/or sell copies of the Software, and to permit persons to whom the
		Software is furnished to do so, subject to the following conditions:
		The above copyright notice and this permission notice shall be included
		in all copies or substantial portions of the Software.*/

		/* Die Funktion wandelt UTM Koordinaten in geographische Koordinaten
		um. UTM Zone, Ostwert ew und Nordwert nw müssen gegeben sein.
		Berechnet werden geographische Länge lw und Breite bw im WGS84 Datum.*/

		// Längenzone zone, Ostwert ew und Nordwert nw im WGS84 Datum
		if (zone == "" || ew == "" || nw == "") {
			zone = "";
			ew = "";
			nw = "";
			return;
		}
		band = zone.substr(2, 1);
		zone = parseFloat(zone);
		ew = parseFloat(ew);
		nw = parseFloat(nw);

		// WGS84 Datum
		// Große Halbachse a und Abplattung f
		a = 6378137.000;
		f = 3.35281068e-3;
		pi = Math.PI;

		// Polkrümmungshalbmesser c
		c = a / (1 - f);

		// Quadrat der zweiten numerischen Exzentrizität
		ex2 = (2 * f - f * f) / ((1 - f) * (1 - f));
		ex4 = ex2 * ex2;
		ex6 = ex4 * ex2;
		ex8 = ex4 * ex4;

		// Koeffizienten zur Berechnung der geographischen Breite aus gegebener
		// Meridianbogenlänge
		e0 = c * (pi / 180) * (1 - 3 * ex2 / 4 + 45 * ex4 / 64 - 175 * ex6 / 256 + 11025 * ex8 / 16384);
		f2 = (180 / pi) * (3 * ex2 / 8 - 3 * ex4 / 16 + 213 * ex6 / 2048 - 255 * ex8 / 4096);
		f4 = (180 / pi) * (21 * ex4 / 256 - 21 * ex6 / 256 + 533 * ex8 / 8192);
		f6 = (180 / pi) * (151 * ex6 / 6144 - 453 * ex8 / 12288);

		// Entscheidung Nord-/Süd Halbkugel
		if (band >= "N" || band == "")
			var m_nw = nw;
		else
			var m_nw = nw - 10e6;

		// Geographische Breite bf zur Meridianbogenlänge gf = m_nw
		sigma = (m_nw / 0.9996) / e0;
		sigmr = sigma * pi / 180;
		bf = sigma + f2 * Math.sin(2 * sigmr) + f4 * Math.sin(4 * sigmr) + f6 * Math.sin(6 * sigmr);

		// Breite bf in Radianten
		br = bf * pi / 180;
		tan1 = Math.tan(br);
		tan2 = tan1 * tan1;
		tan4 = tan2 * tan2;

		cos1 = Math.cos(br);
		cos2 = cos1 * cos1;

		var etasq = ex2 * cos2;

		// Querkrümmungshalbmesser nd
		nd = c / Math.sqrt(1 + etasq);
		nd2 = nd * nd;
		nd4 = nd2 * nd2;
		nd6 = nd4 * nd2;
		nd3 = nd2 * nd;
		nd5 = nd4 * nd;

		// Längendifferenz dl zum Bezugsmeridian lh
		lh = (zone - 30) * 6 - 3;
		dy = (ew - 500000) / 0.9996;
		dy2 = dy * dy;
		dy4 = dy2 * dy2;
		dy3 = dy2 * dy;
		dy5 = dy3 * dy2;
		dy6 = dy3 * dy3;

		b2 = -tan1 * (1 + etasq) / (2 * nd2);
		b4 = tan1 * (5 + 3 * tan2 + 6 * etasq * (1 - tan2)) / (24 * nd4);
		b6 = -tan1 * (61 + 90 * tan2 + 45 * tan4) / (720 * nd6);

		l1 = 1 / (nd * cos1);
		l3 = -(1 + 2 * tan2 + etasq) / (6 * nd3 * cos1);
		l5 = (5 + 28 * tan2 + 24 * tan4) / (120 * nd5 * cos1);

		// Geographische Breite bw und Länge lw als Funktion von Ostwert ew
		// und Nordwert nw
		bw = bf + (180 / pi) * (b2 * dy2 + b4 * dy4 + b6 * dy6);
		lw = lh + (180 / pi) * (l1 * dy + l3 * dy3 + l5 * dy5);
		return {
			latitude : bw,
			longitude : lw
		};
	}
};

module.exports = Module;
