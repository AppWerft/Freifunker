module.exports = function(_args) {
    var self = Ti.UI.createWindow({
       
    });
    self.web = Ti.UI.createWebView({
        url : '/vendor/streetview/index.html',
        enableZoomControls : false,
        scalesPageToFit : true
    });
    self.web.addEventListener('load', function() {
        console.log('createPanorama({lat:' + _args.lat + ',lng:' + _args.lng + '})');
        self.web.evalJS('createPanorama({lat:' + _args.lat + ',lng:' + _args.lng + '})');
    });
    self.add(self.web);
    self.addEventListener('open',  function(_event) {
        var ActionBar = require('com.alcoapps.actionbarextras');
        ActionBar.setTitle(_event.source.title);
        ActionBar.setSubtitle(_event.source.subtitle);
        ActionBar.setFont("Roboto Condensed");
        ActionBar.subtitleColor = "#444";
        ActionBar.setBackgroundColor('#F9EABA');
        var activity = _event.source.getActivity();
        activity.onCreateOptionsMenu = function(_menuevent) {
              _menuevent.menu.clear();
              activity.actionBar.displayHomeAsUp =  true;
              activity.actionBar.onHomeIconItemSelected = function(_e) {
                    _event.source.close();
              };
        };
    });
    return self;
};
