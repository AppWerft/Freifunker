var Canvas = require('com.wwl.canvas');
const YELLOW = '#F9CA45',
    MAGENTA = '#DE4867',
    BLACK = '#000';

module.exports = function() {
	var $ = Ti.UI.createWindow({
		fullscreen : true,
		theme : 'Theme.NoActionBar'
	});
	return $;
};
