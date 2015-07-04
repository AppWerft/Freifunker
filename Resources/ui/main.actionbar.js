var ActionBar = require('com.alcoapps.actionbarextras');
var Map = require('ti.map');
var Moment = require('vendor/moment');
Moment.locale('de');
var MarkerManager = require('vendor/markermanager');

var MM_Freifunk;
var Geo = new (require('vendor/georoute'))();
Geo.getLocation();

if (!String.prototype.rtrim) {
  !function() {
    String.prototype.rtrim = function() {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
  }();
}

module.exports = function(_event) {
	var lastcity = Ti.App.Properties.getString('LASTCITY','Hamburg');
	var lastcityid = Ti.App.Properties.getInt('LASTCITYID',1);
    ActionBar.setTitle('Freifunker');
    ActionBar.setFont('Roboto Condensed');
    ActionBar.setSubtitle(lastcity);
    ActionBar.subtitleColor = "#444";
    ActionBar.setBackgroundColor('#F9EABA');
    
    
    var Freifunk = new (require('adapter/freifunk'))();
                    Freifunk.loadNodes({ 
                      url : require('model/cities')[lastcityid].url,
                      done : function(_nodes) {
                              //_event.source.progress.setRefreshing(false); 
                              var points = _nodes.map(function(node) {
                                    return {
                                        lat : node.geo[0],
                                        lng : node.geo[1],
                                        id : node.id,
                                        title : node.name,
                                    };
                              });
                              Ti.UI.createNotification({message:'Derweil sind '+points.length+ ' Nodes mit Standortangabe parat'}).show();
                              MM_Freifunk = new MarkerManager({
                                name: 'freifunk',
                                map:  _event.source.tabs[0].window.mapView,
                                image: '/images/freifunk.png',
                                points : points
                             });
                          }     
                       }); 
                 	
                 	
    
    
    
    var activity = _event.source.getActivity();
    if (!activity)  return;
        activity.onCreateOptionsMenu = function(_menuevent) {
             _menuevent.menu.clear();
			 require('model/cities').forEach(function(city,i) {
			 	_menuevent.menu.add({
                	title : city.name,
                	itemId : i,
                	checkable: true,
                	checked : lastcity==city.name ? true: false, 
               	    showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
            	 }).addEventListener("click", function() {
                 	_menuevent.menu.findItem(i).checked = true;
                 	_menuevent.menu.findItem(lastcityid).checked = false;
                 	lastcityid =i;
                 	Ti.App.Properties.setInt('LASTCITYID',i);
                 	Ti.App.Properties.setString('LASTCITY',_menuevent.menu.findItem(i).title);
                 	ActionBar.setSubtitle(_menuevent.menu.findItem(i).title);
                 	var Freifunk = new (require('adapter/freifunk'))();
                    Freifunk.loadNodes({ 
                      url : require('model/cities')[i].url,
                      done : function(_nodes) {
                              //_event.source.progress.setRefreshing(false); 
                              var points = _nodes.map(function(node) {
                                    return {
                                        lat : node.geo[0],
                                        lng : node.geo[1],
                                        id : node.id,
                                        title : node.name,
                                    };
                              });
                              Ti.UI.createNotification({message:'Derweil sind '+points.length+ ' Nodes mit Standortangabe parat'}).show();
                              MM_Freifunk = new MarkerManager({
                                name: 'freifunk',
                                map:  _event.source.tabs[0].window.mapView,
                                image: '/images/freifunk.png',
                                points : points
                             });
                          }     
                       }); 
                 	
                 	
                 	
                 	
                 });
			 });             
             activity.actionBar.displayHomeAsUp = false;
        };
        activity && activity.invalidateOptionsMenu();
        activity.actionBar.onHomeIconItemSelected = function(_e) {
            
        }
    
};
