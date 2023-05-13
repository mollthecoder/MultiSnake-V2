const { manager } = require("../managers/roomManager.js");
const { Snake } = require("../objects/snake.js");
const { uid, generateName, json2array, pickColor } = require("../etc/helpers.js");
const { Room } = require("../objects/room.js");
const { io } = require("./webs.js");
const { Bot } = require("../bots/bots.js");
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
    var username = (data.username) ? data.username : generateName();
    var spawn = data.spawn;
    var room = data.room;
    var roomToJoin = manager.getRoom(room);
    if(roomToJoin){
      var id = SPAWN_REQUEST_TRACKER[socket.id] || uid();
      var snakeToCreate = new Snake(id,username,pickColor(), room,spawn);
      roomToJoin.addSnake(snakeToCreate);
      manager.addSnake(snakeToCreate);
    }else{
      var id = SPAWN_REQUEST_TRACKER[socket.id] || uid();
      var rID = uid();
      var roomToCreate = new Room(room,25);
      manager.createRoom(roomToCreate);
      var room = manager.getRoom(roomToCreate.uid);
      var snakeToCreate = new Snake(id,username,pickColor(), roomToCreate.uid,spawn);
      id = snakeToCreate.uid;
      room.addSnake(snakeToCreate);
      manager.addSnake(snakeToCreate);
      socket.join(room.uid);
    }
  })
  socket.on("join_request",(data)=>{
    var room = data.room;
    var roomToJoin = manager.getRoom(room);
    var id = uid();
    SPAWN_REQUEST_TRACKER[socket.id] = id;
    if(roomToJoin){
      socket.join(roomToJoin.uid);
    }else{
      var rID = uid();
      var roomToCreate = new Room(room,25);
      manager.createRoom(roomToCreate);
      var room = manager.getRoom(roomToCreate.uid);
      roomToJoin = room;
      socket.join(room.uid);
    }
    socket.emit("join_request_respond",{
      uid:id,
      room: roomToJoin,
    });
  });
  socket.on("ping",(data)=>{
    socket.emit("pong",data);
  });
  socket.on("change_direction",(data)=>{
    var snake = manager.getSnake(data.uid);
    if(snake){
      snake.changeDirection(data.direction);
    };
  });
  socket.on("chat",(data)=>{
    var from = data.from;
    var message = data.message;
    var room = data.room;
    io.to(room).emit("chat",{
      from: xss(from),
      message: xss(message,xssoptions)
    })
  })
});

module.exports = {

}