<!DOCTYPE html> 
<html>
<head>
    <meta charset="UTF-8" />
    <title>Nodejs -  聊天網頁</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta name="author" content="Hans Huang" />    
</head>
<body>
    <div style="float:left;width:100px;border-right:1px solid black;height:300px;padding:10px;overflow:scroll-y;">
        <b>ROOMS</b>
        <div id="rooms"></div>
		<input id="roomname" style="width:100px;" />
        <input type="button" id="roombutton" value="create room" />
    </div>

    <div style="float:left;width:435px;height:250px;overflow:scroll-y;padding:10px;">
        <div id="conversation" style="width:400px;height:268px;overflow:auto;padding:10px;"></div>
        <input id="data" style="width:363px;" />
        <input type="button" id="datasend" value="send" />
    </div>

   <!--<div style="float:left;width:300px;height:250px;overflow:scroll-y;padding:10px;">
       <div id="room creation"></div>
       <input id="roomname" style="width:200px;" />
       <input type="button" id="roombutton" value="create room" />
   </div>-->
</body>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script src="http://10.1.77.88:8080/socket.io/socket.io.js" type="text/javascript"></script>
<script>
	var socket = io.connect('http://10.1.77.88:8080');
	var currentRoom;

	
	socket.on('connect', function(){
		socket.emit('adduser', prompt("What's your name: "));
	});
	

	socket.on('updatechat', function (username, data) {
		$('#conversation').append('<b>'+ username + ':</b> ' + data + '<br>');		
		$('#conversation').scrollTop($('#conversation').prop('scrollHeight'));
			
	});

	socket.on('updaterooms', function (rooms, current) {
		console.log("updaterooms");
		console.log(rooms);
		console.log(current);
		if(current != null){
			currentRoom = current;
		}
		
		$('#rooms').empty();
		$.each(rooms, function(key, value) {
			if(key == currentRoom){
				$('#rooms').append('<div>' + key + '(' + value + ')</div>');
			}
			else {
				$('#rooms').append('<div><a href="#" onclick="switchRoom(\''+key+'\')">' + key + '(' + value + ')</a></div>');
			}
		});
	});

	function switchRoom(room){
		socket.emit('switchRoom', room);
	}

	$(function(){
		$('#datasend').click( function() {
			var message = $('#data').val();
			$('#data').val('');
			socket.emit('sendchat', message);
		});

		$('#data').keypress(function(e) {
			if(e.which == 13) {
				$(this).blur();
				$('#datasend').focus().click();
				$('#data').focus();
			}
		});

		$('#roombutton').click(function(){
			var name = $('#roomname').val();
			$('#roomname').val('');
			socket.emit('create', name)
		});
	});
</script>
</html>