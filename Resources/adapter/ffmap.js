module.exports = function(args) {
	var url = "http://www.freifunk-karte.de/data.php";
	var xhr = Ti.Network.createHTTPClient({
		timeout : 60000,
		onload : function() {
			var json = JSON.parse(this.responseText);
			var areas = {};
			var nodes = json.allTheRouters.map(function(n) {
				if (!areas[n.community]) {
					areas[n.community] = {
						latmin : n.lat,
						latmax : n.lat,
						lonmin : n.long,
						lonmax : n.long,
					};
				} else {
					areas[n.community].latmin = Math.min(areas[n.community].latmin, n.lat);
					areas[n.community].latmax = Math.max(areas[n.community].latmax, n.lat);
					areas[n.community].lonmin = Math.min(areas[n.community].lonmin, n.long);
					areas[n.community].lonmax = Math.max(areas[n.community].lonmax, n.long);
				}
				return {
					id : n.id,
					lat : n.lat,
					lon : n.long,
					host : n.name,
					status : n.status,
					clients : n.clients,
					community : json.communities[n.community].name
				};
			});
			Object.getOwnPropertyNames(areas).map(function(a) {
				areas[a].latitude = (areas[a].latmax + areas[a].latmin) / 2;
				areas[a].longitude = (areas[a].lonmax + areas[a].lonmin) / 2;
				areas[a].name = a;
				areas[a].radius = (Math.min(areas[a].latmax - areas[a].latmin, areas[a].lonmax - areas[a].lonmin)) / 2 / Math.PI * 200000;
				delete areas[a].latmax;
				delete areas[a].latmin;
				delete areas[a].lonmax;
				delete areas[a].lonmin;
			});

			args && args.done && args.done({
				areas : areas,
				nodes : nodes
			});
		}
	});
	xhr.open('GET', url);
	xhr.send();
};
