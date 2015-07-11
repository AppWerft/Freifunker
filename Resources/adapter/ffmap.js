module.exports = function(args) {
	var url = "http://www.freifunk-karte.de/data.php";
	var xhr = Ti.Network.createHTTPClient({
		timeout : 60000,
		onload : function() {
			var json = JSON.parse(this.responseText);
			var areas = {};
			console.log('areas received');
			var nodes = json.allTheRouters.forEach(function(n) {
				if (!areas[n.community]) {
					areas[n.community] = {
						latmin : n.lat,
						latmax : n.lat,
						lonmin : n.long,
						lonmax : n.long,
						community : n.community,
						points : [[n.lat, n.long]]
					};
				} else {
					areas[n.community].latmin = Math.min(areas[n.community].latmin, n.lat);
					areas[n.community].latmax = Math.max(areas[n.community].latmax, n.lat);
					areas[n.community].lonmin = Math.min(areas[n.community].lonmin, n.long);
					areas[n.community].lonmax = Math.max(areas[n.community].lonmax, n.long);
					areas[n.community].points.push([n.lat, n.long]);
				}
			});
			Object.getOwnPropertyNames(areas).forEach(function(a) {
				var convexHull = new (require('vendor/ConvexHullGrahamScan'))();
				areas[a].points.forEach(function(p) {
					if (p[0] > 45 && p[0] < 60 && p[1] > 3 && p[1] < 25)
						convexHull.addPoint(p[1],p[0]);
				});
				areas[a].hullpoints = convexHull.getHull().map(function(e) {
					return {
						latitude : e.y,
						longitude : e.x
					};
				});
				convexHull = null;
			});
			args && args.done && args.done({
				areas : areas,
			});
		}
	});
	xhr.open('GET', url);
	xhr.send();
};
