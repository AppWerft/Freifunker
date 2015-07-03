module.exports = function() {
    var gcm = require('vendor/gcmjs'),
        pendingData = gcm.getData();
    if (pendingData !== null) {
        console.log('GCM: has pending data on START. Data is:');
        console.log(JSON.stringify(pendingData));
        require('view.green').show(pendingData);
    }
    gcm.doRegistration({
        success : function(ev) {
            console.log('GCM success, deviceToken = ' + ev.deviceToken);
        },
        error : function(ev) {
            console.log('GCM error = ' + ev.error);
        },
        callback : function(data) {
            var dataStr = JSON.stringify(data);
            console.log('GCM notification while in foreground. Data is:');
            console.log(dataStr);
            require('view.white').show(dataStr);
        },
        unregister : function(ev) {
            console.log('GCM: unregister, deviceToken =' + ev.deviceToken);
        },
        data : function(data) {
            console.log('GCM: has pending data on RESUME. Data is:');
            console.log(JSON.stringify(data));
            // 'data' parameter = gcm.data
            require('view.green').show(data);
        }
    });
    require('controls/shoutcast.recorder')({
        url : 'http://dradio_mp3_dlf_m.akacast.akamaistream.net/7/249/142684/v1/gnl.akacast.akamaistream.net/dradio_mp3_dlf_m'
    });
};
