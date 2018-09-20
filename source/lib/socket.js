var WebSocket = require ('ws');
var msgpack = require('msgpack5')();
const info = require('./info');
const pi = require('./raspiCommands');
var _ = require('lodash');
var shell = require('./shell.js');

var ws = null;
var reconnectTime = 500;
var socket = null;

var socketError = null;

const SIMULATE = process.env.WYLIODRIN_LAB_SIMULATE_COMMANDS || false;



async function socketURL ()
{
	await info.updateInfo();
	return info.serverInfo.server+'/socket/board';
}

var sendBoardStatusInterval = null;

async function sendBoardStatus(status){
	try{
		await info.updateInfo();
		let whoAmI = _.assign ({}, info.information, {status});
		socket.send({t:'p', i:whoAmI}); 
	}
	catch(e){
		console.log ('ERROR: sending board status to server '+e.message);
	}
}

async function getCommandFromServer(com){
	switch (com) {
		case 'reboot':
			console.log('Ma rebootez');
			await sendBoardStatus ('reboot');
			pi.reboot(SIMULATE);
			break;
		case 'poweroff':
			console.log('Ma inchid');
			await sendBoardStatus ('offline');
			pi.shutDown(SIMULATE);
			break;
		default:
			console.log('Nu am primit comanda valida');
			console.log(com);
	}
}

async function websocketConnect(){
	ws = new WebSocket(await socketURL());
	ws.on ('open', function (){
		
		console.log ('CONNECTED');
		
		socketError = null;
		reconnectTime = 500;
		socket = {
			close: function ()
			{
				if (ws)
				{
					ws.close();
				}
				else console.log ('SOCKET_END socket is null');
			},
			send: function (data)
			{
				if (ws)
				{
					ws.send (msgpack.encode(data));
				}
				else console.log ('SOCKET_WRITE socket is null');
			}
		};
		
		//send token first
		if (ws) socket.send ({token:info.information.boardId});
		else console.log ('SOCKET_SEND socket is null');
		
		sendBoardStatusInterval = setInterval (sendBoardStatus, 10000);
		
	});
	
	
	
	ws.on ('message', async function (message){
		let data = msgpack.decode (message);
		if (data.t === 'b'){
			//user shell
			if (data.a === 'o'){
				//open
				if (!shell.isShell()){
					shell.openShell(socket);
				}
			}
			else if (data.a === 'c'){
				//close
				if (shell.isShell()){
					shell.kill();
				}
				else{
					socket.send({t:'b', a:'e', e:'noshell'});
				}
			}
			else if (data.a === 'k'){
				//key
				if (shell.isShell()){
					if (_.isString(data.c) || _.isBuffer (data.c)){
						shell.write(data.c);
					}
				}
				else{
					socket.send({t:'b', a:'e', e:'noshell'});
				}
			}
			else if (data.a === 'r'){
				//resize
				if (shell.isShell()){
					shell.resize(data.c, data.d);
				}
				else{
					socket.send({t:'b', a:'e', e:'noshell'});
				}
			}
		} else if (data.t === 'p'){
			await getCommandFromServer(data.c);
		}

	});
	
	ws.on ('error', function (error)
	{
		if (!socketError)
		{
			console.log ('SOCKET '+error.message);
			socketError = error.message;
		}
		if (socket) socket.close ();
		else ws.close();
	});
	
	ws.on ('close', function ()
	{
		if (!socketError)
		{
			console.log ('SOCKET_CLOSE');
		}
		
		socket = null;
		ws = null;
		
		clearInterval(sendBoardStatusInterval);
		sendBoardStatusInterval = null;
		
		setTimeout (async function (){
			reconnectTime = reconnectTime * 2;
			await websocketConnect ();
		}, reconnectTime);
		
	});
}

websocketConnect();