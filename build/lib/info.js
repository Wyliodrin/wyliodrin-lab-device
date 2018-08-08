const { exec } = require('child_process');
let _ = require('lodash');
let Ip = require('ip');
let information = {
	id: '',
	ip: ''
};

function getIp() {
	return Ip.address();

}

function getId() {
	return new Promise(function(resolve, reject) {
		exec('cat /proc/cpuinfo | grep Serial | cut -d \' \' -f 2', function(err, stdout) {
			if (err) {
				reject(err);
			} else {
				let id = stdout.toString().trim();
				while (id[0] == 0) {
					id = _.drop(id);
					let i;
					let info = '';
					let length = id.length;
					for (i = 0; i < length; i++) {
						info = info + id[i];
					}
					id = info;

				}
				// console.log('aici data: ' + id);
				resolve(id);
			}
		});
	});
}
async function updateInfo() {

	information.ip  = getIp();
	information.id = await getId();

}

async function update() {
	await updateInfo();
	setTimeout(update, 5000);
}

update();

module.exports = {
	updateInfo: updateInfo,
	information: information
};