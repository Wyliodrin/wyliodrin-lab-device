const axios = require('axios');
const info = require('./info');
const pi = require('./raspiCommands');
const _ = require ('lodash');


const SIMULATE = process.env.WYLIODRIN_LAB_SIMULATE_COMMANDS || false;

/*
{
	command: undefined | 'reboot' | 'shutdown'
}
*/

function serverURL ()
{
	return info.serverInfo.server+'/api/v1/remote/exchange';
}

async function sendStatus (status)
{
	try
	{
		await info.updateInfo();
		let whoAmI = _.assign ({}, info.information, {
			status
		});
		return axios.post(serverURL (), whoAmI);
	}
	catch (e)
	{
		console.error ('ERROR: send status '+e.message);
	}
}

async function getCommand() {
	try {
		let response = await sendStatus ('online');
		switch (response.data.com) {

			case 'reboot':
				console.log('Ma rebootez');
				await sendStatus ('reboot');
				pi.reboot(SIMULATE);
				break;
			case 'powerOff':
				console.log('Ma inchid');
				await sendStatus ('offline');
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

getCommand ();