var pty = require ('pty.js');
var info = require('./info.js');

var shell = null;

function isShell(){
	return (shell !== null);
}
function kill(){
	if (isShell()){
		shell.kill();
		shell = null;
	}
}
function write(data){
	if (isShell()){
		shell.write(data);
	}
}
function resize(data1, data2){
	if (isShell()){
		shell.resize(data1, data2);
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

module.exports.openShell = openShell;
module.exports.isShell = isShell;
module.exports.kill = kill;
module.exports.write = write;
module.exports.resize = resize;
