var pty = require ('pty.js');
var info = require('./info.js');
var path = require('path');

var shell = null;
var runshell = {};

function isShell(projectId){
	if (projectId === undefined){
		return (shell !== null);
	}
	else{
		return (runshell[projectId] !== undefined && runshell[projectId] !== null);
	}
}
function kill(projectId){
	if (projectId === undefined){
		if (isShell()){
			shell.kill();
			shell = null;
		}
	}
	else{
		if (isShell(projectId)){
			runshell[projectId].kill();
			runshell[projectId] = null;
		}
	}
}
function write(data, projectId){
	if (projectId === undefined){
		if (isShell()){
			shell.write(data);
		}
	}
	else{
		if (isShell(projectId)){
			runshell[projectId].write(data);
		}
	}
}
function resize(data1, data2, projectId){
	if (projectId === undefined){
		if (isShell()){
			shell.resize(data1, data2);
		}
	}
	else{
		if (isShell(projectId)){
			runshell[projectId].resize(data1, data2);
		}
	}
}

function openShell (socket, cmd = 'su', cols = 80, rows = 24)
{
	if (!shell)
	{
		
		shell = pty.spawn(cmd, ['-', 'pi'], {
			rows,
			cols,
			cwd: '/home/pi',
			env: {
				
			}
		});
		
		shell.on ('error', function (error)
		{
			if (error.message.indexOf ('EIO') === -1)
			{
				console.log ('SHELL '+error.message);
			}
		});
		
		shell.on('data', function(data) {
			socket.send ('b', {t:'s', a:'k', id:info.information.boardId, k:data});
		});
		
		shell.on ('exit', function ()
		{
			socket.send ('b', {t:'s', a:'c', id:info.information.boardId});
			shell = null;
		});
	}
	shell.resize (cols, rows);
}

function openShellRun (socket, cmd, projectId, cols = 80, rows = 24)
{
	if (isShell(projectId)){
		kill(projectId);
	}
		
	runshell[projectId] = pty.spawn(cmd, [path.join('/home/pi/projects', projectId, 'main.py')], {
		rows,
		cols,
		cwd: path.join('/home/pi/projects', projectId),
	});
	
	runshell[projectId].on ('error', function (error)
	{
		if (error.message.indexOf ('EIO') === -1)
		{
			console.log ('SHELL '+error.message);
		}
	});
	
	runshell[projectId].on('data', function(data) {
		socket.send ('b', {t:'s', a:'k', id:info.information.boardId, k:data, pid:projectId});
	});
	
	runshell[projectId].on ('exit', function ()
	{
		socket.send ('b', {t:'s', a:'c', id:info.information.boardId, pid:projectId});
		runshell[projectId] = null;
	});
	runshell[projectId].resize (cols, rows);
}

module.exports.openShell = openShell;
module.exports.openShellRun = openShellRun;
module.exports.isShell = isShell;
module.exports.kill = kill;
module.exports.write = write;
module.exports.resize = resize;
