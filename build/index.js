#!/usr/bin/env node
require('dotenv').config();

const lcd = require('./lib/printFunctions');
const board = require('./lib/gpiolib');
const info = require('./lib/info');
const shell = require ('./lib/shell');

console.log(process.env);

async function run () {
	await info.updateInfo();
	if (!info.serverInfo.userId && info.information.serial !== undefined)
	{
		let obj1 = {
			id: 1,
			line1: 'Start at',
			line2: info.serverInfo.servername+'/'+info.information.serial
		};
		lcd.replace(obj1);
	}
	let obj2 = {
		id: 2,
		line1: 'Board IP',
		line2: info.information.ip
	};
	lcd.replace(obj2);
	let obj3 = {
		id: 3,
		line1: 'Board ID',
		line2: info.information.boardId
	};
	lcd.replace(obj3);
	setTimeout (run, 3000);
}

run ();

const socket = require ('./lib/socket.js');
socket.sendBoardStatus('online');


//stanga
board.button2.watch(async function(err, value) {
	if (!shell.isShell('project'))
	{
		board.ledGreen.writeSync(value);
		if (value) {
			await lcd.displayPrevious();
		}
	}
});



//dreapta
board.button1.watch(async function(err, value) {
	if (!shell.isShell ('project'))
	{
		board.ledRed.writeSync(value);
		if (value) {
			await lcd.displayNext();
		}
	}
});