const { manager } = require("../managers/roomManager.js");
const { Snake } = require("../objects/snake.js");
const { uid, generateName, json2array, pickColor } = require("../etc/helpers.js");
const { hashMap } = require("../objects/room.js");
const { io } = require("./webs.js");
const { Bot } = require("../bots/bots.js");
const { apiKeyManager } = require("../managers/databaseManager.js");
var Filter = require('bad-words'),
    filter = new Filter();

var xss = require("xss");
var xssOptions = {
  a: ["href"],
  img: ["src","title","style","alt"],
  h1: ["title","style"],
  h2: ["title","style"],
  h3: ["title","style"],
  h4: ["title","style"],
  h5: ["title","style"],
  h6: ["title","style"],
  b: ["title","style"],
  i: ["title","style"],
  u: ["title","style"]
}


var SPAWN_REQUEST_TRACKER = {};

/*

id: SocketID{
  willSpawnBot: Boolean
  api_key: String,
  uid
}
*/
io.on("connection",(socket)=>{
  socket.on("request_optimal_spawn",(data)=>{
    var room = data.room;
    var roomRef = manager.getRoom(room);


    if(roomRef){
      socket.emit("optimal_spawn",{
        optimal_spawn: roomRef.optimalNextSpawn()
      })
    }
  })
  socket.on("spawn_request",(data)=>{
    if(SPAWN_REQUEST_TRACKER[socket.id]){
      SPAWN_REQUEST_TRACKER[socket.id].willSpawnBot = data.bot;
    }else{
      SPAWN_REQUEST_TRACKER[socket.id] = {
        willSpawnBot: data.bot,
        uid: uid(),
        api_key: data.api_key
      }
    }
    var username = (data.username) ? data.username : generateName();
    var spawn = data.spawn;
    var roomString = data.room;
    var roomType = roomString.split("-")[0] || "standard";
    var room = roomString;
    var roomToJoin = manager.getRoom(room);
    if(roomToJoin){
      var id = SPAWN_REQUEST_TRACKER[socket.id].uid || uid();
      var snakeToCreate = new Snake(id,username,pickColor(), room,spawn,SPAWN_REQUEST_TRACKER[socket.id].willSpawnBot);
      if(SPAWN_REQUEST_TRACKER[socket.id].loggedIn){
        snakeToCreate.login();
      }
      roomToJoin.addSnake(snakeToCreate);
      manager.addSnake(snakeToCreate);
    }else{
      var id = SPAWN_REQUEST_TRACKER[socket.id].uid || uid();
      var rID = uid();
      var roomToCreate = new hashMap[roomType](room,room);
      manager.createRoom(roomToCreate);
      var room = manager.getRoom(roomToCreate.uid);
      var snakeToCreate = new Snake(id,username,pickColor(), roomToCreate.uid,spawn,SPAWN_REQUEST_TRACKER[socket.id].willSpawnBot);
      id = snakeToCreate.uid;
      if(SPAWN_REQUEST_TRACKER[socket.id].loggedIn){
        snakeToCreate.login();
      }
      room.addSnake(snakeToCreate);
      manager.addSnake(snakeToCreate);
      socket.join(room.uid);
    }
  })
  socket.on("join_request",async (data)=>{
    var room = data.room;
    var api_key = data.api_key;
    var uidPlease = data.uidPlease;
    var key_data = await apiKeyManager.getAPIKey(api_key);
    
    var roomString = data.room;
    var roomType = roomString.split("-")[0] || "standard";
    var room = roomString;
    var roomToJoin = manager.getRoom(room);
    var id = (uidPlease) ? uidPlease : uid();
    var loggedIn = (uidPlease) ? true :false;

    var room_key = null;
    if(roomToJoin){
      socket.join(roomToJoin.uid);
      room_key = roomToJoin.uid;
    }else{
      var rID = uid();
      var roomToCreate = new hashMap[roomType](room,room);
      manager.createRoom(roomToCreate);
      var room = manager.getRoom(roomToCreate.uid);
      roomToJoin = room;
      var room_key = room.uid;
    }
    if(key_data){
      if(key_data.expiredAt > new Date().getTime()){
        if(!manager.getSnake(key_data.uid)){
          await apiKeyManager.updateUid(api_key,id)
          SPAWN_REQUEST_TRACKER[socket.id] = {
            uid: id,
            api_key,
            loggedIn,
            willSpawnBot: (data.bot) ? true : false
          }
          socket.join(room_key);
          socket.emit("join_request_respond",{
            uid:id,
            room: roomToJoin,
          });
        }else{
          socket.emit("error",{
            code: 100,
            message: "A player already exists with this API key.",
            otherPlayer: manager.getSnake(key_data.uid)
          })
        }
      }else{
        socket.emit("error",{
          code: 101,
          message: "Your API key is expired - if you're running this game in the browser, try refreshing the page."
        })
      }
      
    }else{
      socket.emit("error",{
        code: 102,
        message: "API key does not exist"
      });
    }
  });
  socket.on("ping",(data)=>{
    socket.emit("pong",data);
  });
  socket.on("change_direction",async (data)=>{
    var api_key = data.api_key;
    var snake = manager.getSnake(data.uid);

    var key_data = await apiKeyManager.getAPIKey(api_key);

    if(!key_data){
      socket.emit("error",{
        message:"API key does not exist"
      })
    }else if(key_data.uid == data.uid){
      if(key_data.expiredAt == -1 || key_data.expiredAt > new Date().getTime()){
        var snake = manager.getSnake(data.uid);
        if(snake){
          snake.changeDirection(data.direction);
        };
      }else{
        socket.emit("error",{
          message:"API key expired"
        });
      }
    }else{
      socket.emit("error",{
        message: "API key and UID mismatch"
      });
      var snake = manager.getSnake(data.uid);
      if(snake){
        io.to(snake.getRoom().uid).emit("chat",{
          from: "System",
          message: `Someone seems to be trying to hack ${snake.name}. Watch out!`
        });
      }
    }
  });
  socket.on("chat",(data)=>{
    var from = data.from;
    var message = data.message;
    var room = data.room;
    try{
      io.to(room).emit("chat",{
        from: filter.clean(xss(from)),
        message: filter.clean(xss(message,xssOptions))
      })
    }catch(err){
      io.emit("error",{
        code: 200,
        message: "Failed to clean messages"
      })
    }
  })
});

module.exports = {

}