const { execSync } = require('child_process');

function shutDown(simulate = false) {

	console.log('MA INCHIIID <3');
	if (!simulate) {
		execSync('sudo poweroff');
	} else {
		console.log('shut-down simulation');
	}
	//TODO catch error
}

function reboot(simulate = false) {
	console.log('MA RESTAREEZ <3');
	if (!simulate) {
		execSync('sudo reboot');
	} else {
		console.log('reboot simulation');
	}
	//TODO catch error
}

module.exports = {
	reboot,
	shutDown
};