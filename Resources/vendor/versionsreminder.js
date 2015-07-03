function str2int(foo) {
    var parts = foo.split('.');
    return 100000 * parts[0] + 1000 * parts[1] + parts[2];
}

module.exports = function() {
    var thisversion = str2int(Ti.App.getVersion());
    var e = (arguments[0] || {}, "https://play.google.com/store/apps/details?id=" + Ti.App.getId()),
        t = Ti.Network.createHTTPClient({
        onerror : function() {
            console.log('Warning: no connection to playstore ' + thisversion);
            return;
        },
        onload : function() {
            var t = /itemprop="softwareVersion">(.*?)</m.exec(this.responseText);
            if (!t) {
                console.log('Warning: no connection to playstore ' + thisversion);
                return;
            }
            var storeversion = str2int(( version = t[1].replace(/\s+/g, "")));
            console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\nStore=' + storeversion + '  eigene Version=' + thisversion);
            if (storeversion > thisversion) {
                var dialog = Ti.UI.createAlertDialog({
                    cancel : 1,
                    buttonNames : ["Zum Store", "Abbruch"],
                    message : "Es gibt eine neue Version im Playstore.\n\nDiese App auf dem " + Ti.Platform.model + ' hat die Version ' + Ti.App.getVersion() + "\n\nIm Store ist  " + version + ".\n\nMöchtest Du erneuern?",
                    title : "Neue Version „" + Ti.App.getName() + "“"
                });
                dialog.show();
                dialog.addEventListener("click", function(t) {
                    t.index != t.source.cancel && Ti.Platform.openURL(e);
                });
            } else if (storeversion < thisversion) {
                Ti.Android && Ti.UI.createNotification({
                    message : Ti.App.getName() + " ist neuer als neu … (" + Ti.App.getVersion() + ")"
                }).show();
            } else if (storeversion == thisversion)
                Ti.Android && Ti.UI.createNotification({
                    message : Ti.App.getName() + " ist in neuester Version (" + Ti.App.getVersion() + ")"
                }).show();
        }
    });
    t.open("GET", e), t.send();
};
