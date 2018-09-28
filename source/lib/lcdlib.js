const Lcd = require('lcd');
const shell = require ('./shell');
var _ = require ('lodash');

const RS = 12;
const E = 25;
const DATA = [6, 26, 24, 16];
const COLS = 16;
const ROWS = 2;

const lcd = new Lcd({ rs: RS, e: E, data: DATA, cols: COLS, rows: ROWS });

var initialized = false;

lcd.on('ready', function() {
	initialized = true;
});


////Utility functions
function write(string, col = 0, row = 0) {
	return new Promise(function(resolve) {
		//TODO catch err
		if (!shell.isShell ('project'))
		{
			lcd.setCursor(col, row);
			lcd.print(string, function() {
				resolve();
			});
		}
		else
		{
			resolve ();
		}
	});

}

function clear(force = false) {
	if (!shell.isShell ('project') || force === true)
	{
		lcd.clear();
	}
}

function init() {
	return new Promise(function(resolve) {
		if (!initialized) lcd.on('ready', resolve);
		else process.nextTick(resolve);
	});
}


module.exports = _.assign (module.exports, {
	blink: lcd.blink,
	write: write,
	clear: clear,
	init: init
});