function Connection(server_address,server_port){
  this.websocket = null;
  this.server_uri = "ws://"+server_address+":"+server_port;
  this.init();
}

Connection.prototype.init = function(){
  console.log("Initializing connection");

  this.websocket = new WebSocket(this.server_uri);

  var _this = this;

  this.websocket.onopen = function (evt){_this.onOpen(evt);};
  this.websocket.onclose = function (evt){_this.onClose(evt);};
  this.websocket.onmessage = function (evt){_this.onMessage(evt);};
  this.websocket.onerror = function (evt){_this.onError(evt);};
};

Connection.prototype.onOpen = function(evt){
  var id = window.localStorage.getItem("player_name");
  var data = {player_name: id };
  this.sendData("connectToServer", data);
  this.sendMessage("gameList");
  console.log("Connecting to server...");
};

Connection.prototype.onClose = function(evt){
  this.sendMessage("disconnect");
  console.log("Connection closed...");
};

Connection.prototype.onMessage = function(evt){
  try{
    var parsed = evt.data;
    if(!parsed || parsed == 'null'){
		return;
	}
    parsed = JSON.parse(parsed);
  }catch(e){
    console.log(e);
    return;
  }
 
  var message = parsed.message;
  var data = parsed.data;
  console.log("i have a message")
  console.log(message);
  switch(message){

    case "rooms" : window.showRooms(data.rooms);break;
    case "disconnect": window.game.onDisconnect();break;
    case "roomUpdate": window.roomUpdate(data);break;
    case "start": window.game.onStart(data.playerData); break;
    case "gameList":window.setGameList(data.game_list);break;
    case "gameData":window.game.dataHandler(data);break;
    case "connectSuccess": window.setPlayer(data);break;

    default : console.log(data); console.log("Unsupported message");
  }
};

Connection.prototype.sendMessage = function(message){
  var request = {
    message: message,
    data: {
        player_id: window.player.id,
        room_id: window.player.room_id
    }
  };
  request = JSON.stringify(request);
  this.websocket.send(request);
};

Connection.prototype.sendData = function(message, data){
  var request = {
    message: message,
    data : data
  };
  request = JSON.stringify(request);
  this.websocket.send(request);
};

Connection.prototype.sendGameData = function(data){
  this.sendData("gameData", data);
};

Connection.prototype.selectGame = function(game_id){
  var data = {
    game_id : game_id
  };

  this.sendData("selectGame",data);
};

Connection.prototype.onError = function(evt){
  this.sendMessage("Error occured");
  console.log("Error occured...");
};

Connection.prototype.joinRoom = function(room_id, player_name){

  var data = {
    name: player_name,
    room_id: room_id
  };
  window.player.room_id = room_id;
  this.sendData("connectToRoom",data);
};

Connection.prototype.exitRoom = function(room_id, player_name){
  var data = {
    name: player_name,
    room_id: room_id
  };
  this.sendData("exitRoom",data);
};
