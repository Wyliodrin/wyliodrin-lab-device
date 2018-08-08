require('dotenv').config();

const lcd = require('./lib/printFunctions');
const board = require('./lib/gpiolib');
const info = require('./lib/info');

console.log(process.env);

async function run () {
	await info.updateInfo();
	let obj1 = {
		id: 1,
		line1: 'adresa ip',
		line2: info.information.ip
	};
	let obj2 = {
		id: 2,
		line1: 'id-ul placii',
		line2: info.information.id
	};
	lcd.push(obj1);
	lcd.push(obj2);
	lcd.displayCurrent();
}

run ();



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