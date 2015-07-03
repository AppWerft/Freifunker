module.exports = function() {
    var now = new Date().getTime();
    var remindToRate = Ti.App.Properties.getString('RemindToRate');
    if (!remindToRate) {
        Ti.App.Properties.setString('RemindToRate', now);
    } else if (remindToRate < now) {
        var alertDialog = Ti.UI.createAlertDialog({
            title : 'Bitte bewerte diese App!',
            message : 'Möchtest Du jetzt die Mediathek bewerten?',
            buttonNames : ['OK', 'Erinnere mich später', 'Nie wieder'],
            cancel : 2
        });
        alertDialog.addEventListener('click', function(evt) {
            switch (evt.index) {
                case 0:
                    Ti.App.Properties.setString('RemindToRate', Number.MAX_VALUE);
                    // NOTE: replace this with your own iTunes link; also, this won't WON'T WORK IN THE SIMULATOR!
                    if (Ti.Android) {
                       // Ti.Platform.openURL('https://play.google.com/store/apps/details?id=de.appwerft.dlrmediathek');
                        Ti.Platform.openURL('market://details?id=de.appwerft.dlrmediathek');
                    }
                    break;
                case 1:
                    // "Remind Me Later"? Ok, we'll remind them tomorrow when they launch the app.
                    Ti.App.Properties.setString('RemindToRate', now + (1000 * 60 * 60 * 24));
                    break;
                case 2:
                    Ti.App.Properties.setString('RemindToRate', Number.MAX_VALUE);
                    break;
            }
        });
        alertDialog.show();
    }
};