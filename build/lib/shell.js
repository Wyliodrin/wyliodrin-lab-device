var pty = require ('pty.js');
var info = require('./info.js');

var shell = null;

function isShell(){
	return (shell === null);
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

function openShell (socket, cmd = 'bash', cols = 80, rows = 24)
{
	if (!shell)
	{
		
		shell = pty.spawn(cmd, [], {
			rows,
			cols,
			HOME: '/home/pi',
			USER: 'pi',
			USERNAME: 'pi'
		});
		
		shell.on ('error', function (error)
		{
			if (error.message.indexOf ('EIO') === -1)
			{
				console.log ('SHELL '+error.message);
			}
		});
		
		shell.on('data', function(data) {
			socket.send ({t:'u', a:'k', b:info.information.boardId, c:data});
		});
		
		shell.on ('exit', function ()
		{
			socket.send ({t:'u', a:'c', b:info.information.boardId});
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
