const { exec } = require('child_process');
let _ = require('lodash');
let Ip = require('ip');
const fs = require ('fs-extra');
var spawnPrivileged = require ('./execute').spawnPrivileged;
var spawn = require ('./execute').spawn;
var path = require ('path');
var axios = require ('axios');

var serverInfo = {

};

let information = {
	boardId: '',
	ip: ''
};

function readServerInfo ()
{
	let cmdline = fs.readFileSync ('/proc/cmdline').toString ();
	let matchServer = cmdline.match (/server=([^ $\n\r]+)/);
	// Server IP
	if (matchServer)
	{
		serverInfo.server = matchServer[1];
		console.log ('Server: '+serverInfo.server);
	}
	else
	{
		serverInfo.error = 'Server IP not found';
	}

	let matchServerName = cmdline.match (/servername=([^ $\n\r]+)/);
	// Server Name
	if (matchServerName)
	{
		serverInfo.servername = matchServerName[1];
		console.log ('Server: '+serverInfo.servername);
	}
	else
	{
		serverInfo.servername = 'wlab.run';
		
	}

	let matchNfsServer = cmdline.match (/nfsroot=([^:]+)/);
	// Server IP
	if (matchNfsServer)
	{
		serverInfo.nfsServer = matchNfsServer[1];
		console.log ('NFS Server: '+serverInfo.nfsServer);
	}

	let matchNfsPath = cmdline.match (/nfsroot=[^:]+:([^ $\n\r]+)/);
	// Server IP
	if (matchNfsPath)
	{
		serverInfo.nfsPath = path.dirname(path.dirname(path.dirname(matchNfsPath[1])));
		console.log ('NFS Path: '+serverInfo.nfsPath);
	}

	
	// Course ID
	let matchCourse = cmdline.match (/courseId=([A-Za-z0-9\-_]+)/);
	if (matchCourse)
	{
		serverInfo.courseId = matchCourse[1];
		console.log ('Course ID: '+serverInfo.courseId);
	}

	// User ID
	let matchUser = cmdline.match (/userId=([A-Za-z0-9\-_]+)/);
	if (matchUser)
	{
		serverInfo.userId = matchUser[1];
		console.log ('User ID: '+serverInfo.userId);
	}
	if (!information.serial) updateSerial ();
}

async function isMountedPi ()
{
	let mount = false;
	try
	{
		let run = await spawn ('bash', ['-c', 'mount | grep /home/pi']);
		if (run.exitCode === 0)
		{
			mount = true;
		}
	}
	catch (e)
	{
		console.error ('ERROR: is mounted pi '+e.message);
	}
	return mount;
}

async function updateSerial ()
{
	try
	{
		let url = serverInfo.servername;
		if (url.indexOf ('http')!==0) url = 'https://'+url;
		let data = await axios.get (url+'/board/'+information.boardId);
		if (data && data.err === 0 && data.serial) information.serial = data.serial;
	}
	catch (e)
	{
		console.error ('Unable to update serial: '+e.message);
	}
}

async function mountPi ()
{
	if (information.userId && !await isMountedPi())
	{
		console.log ('mount pi');
		try
		{
			await spawnPrivileged ('mount', ['-t', 'nfs', serverInfo.nfsServer+':'+serverInfo.nfsPath+'/home/'+serverInfo.userId, '/home/pi']);
		}
		catch (e)
		{
			console.error ('ERROR: mount pi '+e.message);
		}
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
	if (!information.boardId) information.boardId = await getId();
	information.userId = serverInfo.userId;
	information.courseId = serverInfo.courseId;
}

async function update() {
	await updateInfo();
	await mountPi ();
	setTimeout(update, 5000);
}

readServerInfo ();
update();

module.exports = {
	updateInfo: updateInfo,
	information: information,
	serverInfo: serverInfo
};