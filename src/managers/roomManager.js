const { json2array } = require("../etc/helpers.js");

class Manager{
  constructor(){
    this.rooms = {};
    this.snakes = {};
    this.ticking = false;
  }

  kill(uid){
    if(this.snakes[uid]){
      var room = this.snakes[uid].room;
      if(this.rooms[room]){
        this.rooms[room].killSnake(uid);
        delete this.snakes[uid];
      }
    }
  }
  addSnake(snake){
    this.snakes[snake.uid] = snake;
  }
  getSnake(uid){
    return this.snakes[uid];
  }
  createRoom(room){
    if(!this.ticking){
      this.ticking = true;
    }
    this.rooms[room.uid] = room;
  }
  getRoom(id){
    return this.rooms[id];
  }
  resetRoom(id){
    if(this.rooms[id]){
      this.rooms[id].reset();
    }
  }
  deleteRoom(id){
    delete this.rooms[id]
  }
  online(){
    var online = 0;
    online += json2array(this.snakes).length;
  }
}

var server1 = new Manager();
exports.manager = server1;