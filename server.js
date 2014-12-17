//note: 2014.10.30
var express = require("express");
    app = express(),
    http = require("http"),
    server = http.createServer(app),
    io = require('socket.io').listen(server);
 
server.listen(8080);
console.log('Server running');
 
// Routing，其實這首頁沒什麼用
/*
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/qrcode', function (req, res) {
  res.sendfile(__dirname + '/qrcode.html');
});

app.get('/getQRKey', function (req, res) {
  res.send('key:' + req.query.key);
});
*/
// 連線
/*
io.sockets.on('connection', function (socket) { 
   // 偵聽 send 事件
    socket.on('send', function (data) { 
        // 然後我們依據 data.act 做不同的動作
        switch ( data.act )
        {
            // 這個是使用者打開手機網頁後發生的事件
            case "enter":
            io.sockets.emit('get_response', data);
            console.log("Sending getEnter");
            break;
 
            // 這個是使用者在手機網頁中點擊按鈕，讓電腦網頁背景變色的事件
            case "changebg":
            io.sockets.emit('get_response', data);
            console.log("Sending changeBg");
            break;
        }
 
    });
 
});
*/
/*
io.sockets.on('connection', function (socket) {
	console.log("connect");
	socket.on('send', function(data) {
		io.sockets.emit('getResponse' + data.key, data);
		console.log("Response(" + data.key + ") " + data.name + ":" + data.msg);
	});
});

app.get('/getConn', function (req, res) {
	var key = NewGuid();
	res.send('聊天室ID:' + key);
});

function S4() {
	return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

function NewGuid() {
	return (S4()+S4());
}
*/
var usernames = {};
var rooms = {};
rooms['Lobby'] = 0;
io.set('log level',0);
io.sockets.on('connection', function(socket) {
    socket.on('adduser', function(username) {
        socket.username = username;
        socket.room = 'Lobby';
        
        socket.join('Lobby');
        socket.emit('updatechat', 'SERVER', 'you have connected to Lobby');
        socket.broadcast.to('Lobby').emit('updatechat', 'SERVER', username + ' has connected to this room');
		
		rooms[socket.room]++;
		usernames[username] = username;
        updateRooms();	
		console.log(usernames);
    });

    socket.on('create', function(room) {
        rooms[room] = 0;
		updateRooms();
    });

    socket.on('sendchat', function(data) {
        io.sockets["in"](socket.room).emit('updatechat', socket.username, data);
    });

    socket.on('switchRoom', function(newroom) {
        var oldroom;
        oldroom = socket.room;
        socket.leave(socket.room);
        socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username + ' has left this room');
		
		socket.join(newroom);
        socket.room = newroom;
		socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
		
		rooms[oldroom]--;
		rooms[socket.room]++;
		leaveRoom(oldroom);
        updateRooms();
    });

    socket.on('disconnect', function() { 
		delete usernames[socket.username];
		
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
		
		rooms[socket.room]--;
		leaveRoom(socket.room);
		updateRooms();
    });
	
	function updateRooms(){
		socket.emit('updaterooms', rooms, socket.room);
        socket.broadcast.emit('updaterooms', rooms ,null);
	}
	
	function leaveRoom(room){
		if(room!='Lobby' && rooms[room]<=0){
			delete rooms[room];
		}
	}
 });
 
 
