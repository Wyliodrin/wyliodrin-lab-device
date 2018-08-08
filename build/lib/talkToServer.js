const axios = require('axios');
const info = require('./info');
const pi = require('./raspiCommands');
const _ = require ('lodash');

const SERVER = process.env.WYLIODRIN_LAB_SERVER;
const SIMULATE = process.env.WYLIODRIN_LAB_SIMULATE_COMMANDS || false;

/*
{
	command: undefined | 'reboot' | 'shutdown'
}
*/

async function getCommand() {
	try {
		await info.updateInfo();
		let whoAmI = _.assign ({}, info.information, {status: 'online'});
		let response = await axios.post(SERVER, whoAmI);
		switch (response.data.com) {

			case 'reboot':
				console.log('Ma rebootez');
				pi.reboot(SIMULATE);
				break;
			case 'powerOff':
				console.log('Ma inchid');
				pi.shutDown(SIMULATE);
				break;
			default:
				console.log('Nu am primit comanda valida');
				console.log(response.data);
		}

	} catch (error) {
		console.error(error);
	}
	setTimeout (getCommand, 10000);
}

getCommand();