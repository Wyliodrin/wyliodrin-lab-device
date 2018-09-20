#!/usr/bin/env node
require('dotenv').config();

const lcd = require('./lib/printFunctions');
const board = require('./lib/gpiolib');
const info = require('./lib/info');

console.log(process.env);

async function run () {
	await info.updateInfo();
	let obj1 = {
		id: 1,
		line1: 'Device IP',
		line2: info.information.ip
	};
	let obj2 = {
		id: 2,
		line1: 'Device ID',
		line2: info.information.boardId
	};
	lcd.replace(obj1);
	lcd.replace(obj2);
	setTimeout (run, 3000);
}

run ();

require ('./lib/socket.js');


//stanga
board.button2.watch(async function(err, value) {
	board.ledGreen.writeSync(value);
	if (value) {
		await lcd.displayPrevious();
	}
});



//dreapta
board.button1.watch(async function(err, value) {
	board.ledRed.writeSync(value);
	if (value) {
		await lcd.displayNext();
	}

});