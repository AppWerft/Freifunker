const FIRSTPOINT = 0;

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

var Matrix = Ti.UI.create2DMatrix({
});

var getDistBearing = function(φ1, λ1, φ2, λ2) {
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
};

var Widget = function(args) {
	console.log(args);
	return;
	if (!Array.isArray(args))
		return null;
	this.route = args;
	var that = this;
	this.nodeposition = {
		φ : this.route[FIRSTPOINT][0],
		λ : this.route[FIRSTPOINT][1]
	};
	function _onLocation(_e) {
		if (_e.success) {
			that.myposition = {
				φ : _e.coords.latitude,
				λ : _e.coords.longitude
			};
		}
	};
	function _onHeading(_e) {
		var heading = Math.round(_e.heading.trueHeading || _e.heading.magneticHeading);
		if (heading != that.lastheading && that.myposition && that.nodeposition) {
			var distbear = getDistBearing(that.myposition.φ, that.myposition.λ, that.nodeposition.φ, that.nodeposition.λ);
			that.arrowView.transform = Ti.UI.create2DMatrix({
				rotate : distbear.bearing - heading
			});
			that.distanceView.setText(Math.round(distbear.distance) + ' m');
			that.lastheading = heading;
		}
	}

	/* start of rendering : */
	this.view = Ti.UI.createView({
		backgroundColor : 'transparent'
	});
	this.arrowView = Ti.UI.createLabel({
		text : '⬆',
		color : '#DD2A66',
		opacity : 0.8,
		font : {
			fontSize : 280
		}
	});
	this.distanceView = Ti.UI.createLabel({
		text : '∞',
		color : '#F9EABA',
		height : Ti.UI.SIZE,
		bottom : 30,
		font : {
			fontSize : 100,
			fontFamily : 'Roboto Condensed'
		}
	});
	this.view.add(this.arrowView);
	//this.view.add(this.distanceView);
	this.view.start = function() {
		if (Ti.Geolocation.locationServicesEnabled) {
			Ti.Geolocation.Android.addLocationProvider(Ti.Geolocation.Android.createLocationProvider({
				name : Ti.Geolocation.PROVIDER_GPS,
				minUpdateDistance : 0.0,
				minUpdateTime : 0
			}));
			Ti.Geolocation.Android.manualMode = true;
			Ti.Geolocation.addEventListener('heading', _onHeading);
			Ti.Geolocation.addEventListener('location', _onLocation);
		} else
			Ti.UI.createNotification({
				message : 'Wenn schon offline, dann doch wenigstens GPS ;-))'
			}).show();
	};
	this.view.stop = function() {
		Ti.Geolocation.removeEventListener('heading', _onHeading);
		Ti.Geolocation.removeEventListener('location', _onLocation);
	};
	return this.view;
};

exports.createView = function(args) {
	return new Widget(args);
};
