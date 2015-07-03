var Moment = require('vendor/moment');
var locked;

module.exports = function() {
    if (!locked) {
        locked = true;
        var now = new Date().getTime();
        var geoallowed = Ti.App.Properties.getString('GEOALLOWED_TIMER');
        if (!geoallowed) {
            Ti.App.Properties.setString('GEOALLOWED_TIMER', now);
        } else if (geoallowed < now ) {
            var alertDialog = Ti.UI.createAlertDialog({
                title : 'Hörerkarte',
                message : 'Möchtest Du völlig anonymisiert Deinen ungefähren Standort in diese  Karte eintragen?',
                buttonNames : ['OK, gerne', 'Erinnere mich später', 'unwideruflich Nein'],
                cancel : 2
            });
            alertDialog.addEventListener('click', function(evt) {
                locked = false;
                switch (evt.index) {
                case 0:
                    Ti.App.Properties.setString('GEOALLOWED_TIMER', Number.MAX_VALUE);
                    Ti.App.Properties.setString('GEOALLOWED', '1');
                    break;
                case 1:
                    // "Remind Me Later"? Ok, we'll remind them tomorrow when they launch the app.
                    Ti.App.Properties.setString('GEOALLOWED_TIMER', now + (1000 * 60 * 60 * 24));
                    break;
                case 2:
                    Ti.App.Properties.setString('GEOALLOWED_TIMER', Number.MAX_VALUE);
                    break;
                }
            });
            alertDialog.show();
        }
    }
}; 