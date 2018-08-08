const spawnPrivileged = require ('./execute').spawnPrivileged;

async function shutDown(simulate = false) {

	console.log('MA INCHIIID <3');
	if (!simulate) {
		await spawnPrivileged ('poweroff');
	} else {
		console.log('shut-down simulation');
	}
	//TODO catch error
}

async function reboot(simulate = false) {
	console.log('MA RESTAREEZ <3');
	if (!simulate) {
		await spawnPrivileged('reboot');
	} else {
		console.log('reboot simulation');
	}
	//TODO catch error
}

module.exports = {
	reboot,
	shutDown
};