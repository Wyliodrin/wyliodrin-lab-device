const { exec } = require('child_process');
let _ = require('lodash');
let Ip = require('ip');
const fs = require ('fs-extra');

var serverInfo = {

};

let information = {
	id: '',
	ip: ''
};

function readServerInfo ()
{
	let cmdline = fs.readFileSync ('/proc/cmdline').toString ();
	let matchServer = cmdline.match (/server=([^ $]+)/);
	// Server IP
	if (matchServer)
	{
		serverInfo.server = matchServer[1];
	}
	else
	{
		serverInfo.error = 'Server IP not found';
	}
	
	// Course ID
	let matchCourse = cmdline.match (/courseId=[A-Za-z0-9\-_]+/);
	if (matchCourse)
	{
		serverInfo.courseId = matchCourse[1];
	}

	// User ID
	let matchUser = cmdline.match (/userId=[A-Za-z0-9\-_]+/);
	if (matchUser)
	{
		serverInfo.userId = matchUser[1];
	}
}

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

	information.ip = getIp();
	if (!information.id) information.boardId = await getId();
	information.userId = serverInfo.userId;
	information.courseId = serverInfo.courseId;
}

async function update() {
	readServerInfo ();
	await updateInfo();
	setTimeout(update, 5000);
}

update();

module.exports = {
	updateInfo: updateInfo,
	information: information,
	serverInfo: serverInfo
};