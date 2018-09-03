var WebSocket = require ('ws');
var msgpack = require('msgpack5');
const info = require('./info');
var _ = require('lodash');
var shell = require('./shell.js');

var ws = null;
var reconnectTime = 500;
var socket = null;

var socketError = null;

function socketURL ()
{
	return info.serverInfo.server+'/socket/board';
}

function websocketConnect(){
    ws = new WebSocket(socketURL());
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

    });



    ws.on ('message', function (message){
        if (!_.isObject (message))
        {
            let data = msgpack.decode (message);
            if (data.t === 'u'){
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
                        socket.send({t:'u', a:'e', e:'noshell'});
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
                        socket.send({t:'u', a:'e', e:'noshell'});
                    }
                }
                else if (data.a === 'r'){
                    //resize
                    if (shell.isShell()){
                        shell.resize(data.c, data.d);
                    }
                    else{
                        socket.send({t:'u', a:'e', e:'noshell'});
                    }
                }
            }
        }
    });

    ws.on ('error', function (error)
    {
        if (!socketError)
        {
            console.log ('SOCKET '+error.message);
            socketError = error.message;
        }
        socket.close ();
    });

    ws.on ('close', function ()
    {
        if (!socketError)
        {
            console.log ('SOCKET_CLOSE');
        }

        socket = null;
        ws = null;
        setTimeout (function (){
            reconnectTime = reconnectTime * 2;
            websocketConnect ();
        }, reconnectTime);

    });
}