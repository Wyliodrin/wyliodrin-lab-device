const lcd = require('./lcdlib');
const _ = require('lodash');

let array = [];
let index = 0;
let delay = 300;


function doesIdExist(id) {

	let ans = _.findIndex(array, function(obj) {
		return (obj.id === id);
	});
	if (ans === -1) {
		return false;
	} else {
		return true;
	}
}

async function writeObjectOnLcd(index) {

	await lcd.init();
	await lcd.clear();
	await lcd.write(array[index].line1, 0, 0);
	await lcd.write(array[index].line2, 0, 1);


}

function pop() {
	return array.pop();
}

function push(object) {

	let index = array.length;
	if (_.isUndefined(object.id)) {
		let i = 0;
		while (_.isUndefined(object.id)) {

			if (doesIdExist(i)) {
				i++;
			} else {
				object.id = i;
			}
		}

	}

	if (_.isUndefined(object.line1)) {
		object.line1 = '';
	}

	if (_.isUndefined(object.line2)) {
		object.line2 = '';
	}

	array.splice(index, 0, object);
	return object;
}

function removeByIndex(index) {
	array.splice(index, 1);
}

function removeById(id) {


	let indexToRemove = 0;
	do {
		indexToRemove = _.findIndex(array, function(obj) {
			return (obj.id === id);
		}, indexToRemove);

		_.pullAt(array, indexToRemove);

	} while (indexToRemove !== -1);

}

function displayNext() {
	setTimeout(function() {
		if (index === array.length - 1) {
			writeObjectOnLcd(index = 0);
		} else {
			writeObjectOnLcd(++index);
		}
	}, delay);

}

function displayCurrent() {
	setTimeout(function() {
		writeObjectOnLcd(index);
	}, delay);
}

function displayPrevious() {
	setTimeout(function() {
		if (index === 0) {
			writeObjectOnLcd(index = array.length - 1);
		} else {
			writeObjectOnLcd(--index);
		}
	}, delay);

}

function displayOnce(obj) {
	setTimeout(async function() {
		await lcd.init();
		await lcd.clear();
		await lcd.write(obj.line1, 0, 0);
		await lcd.write(obj.line2, 0, 1);

	}, delay);
}

module.exports = {
	removeById: removeById,
	removeByIndex: removeByIndex,
	push: push,
	pop: pop,
	displayOnce: displayOnce,
	displayPrevious: displayPrevious,
	displayNext: displayNext,
	displayCurrent: displayCurrent

};