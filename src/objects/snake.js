const { manager } = require("../managers/roomManager.js");
const { sumArrays } = require("../etc/helpers.js");
const { dbManager } = require("../managers/databaseManager.js");
class Snake{
  constructor(uid,name,color,room,spawn,isBot=false){
    this.uid = uid;
    this.name = name;
    this.color = color;
    this.bot = isBot;
    this.loggedIn = false;
    this.directionMap = {
      "up":[0,1],
      "down":[0,-1],
      "left":[-1,0],
      "right":[1,0]
    }
    if(spawn){
      if(spawn.point){
        this.body = [spawn.point]
      }else{
        this.body = [[Math.floor(Math.random() * (manager.getRoom(room).size*0.75)),Math.floor(Math.random() * (manager.getRoom(room).size*0.75))]]
      }
      if(spawn.direction){
        this.direction = spawn.direction
      }else{
        this.direction = Object.keys(this.directionMap)[Math.floor(Math.random() * Object.keys(this.directionMap).length)];
      }
    }else{
      this.direction = Object.keys(this.directionMap)[Math.floor(Math.random() * Object.keys(this.directionMap).length)];
      this.body = [[Math.floor(Math.random() * (manager.getRoom(room).size*0.75)),Math.floor(Math.random() * (manager.getRoom(room).size*0.75))]]
    }
    this.score = this.body.length;
    this.speed = 0;
    this.room = room;
    this.eating = false;
    this.creationTime = new Date().getTime();
  }
  login(){
    this.loggedIn = true;
  }
  getRoom(){
    return manager.getRoom(this.room);
  }
  kill(){
    manager.kill(this.uid);
    delete this;
  }
  changeDirection(direction){
    this.direction = direction;
  }
  move(){
    var head = this.body[0];
    var newBlock = sumArrays(head,this.directionMap[this.direction]);
    if(!this.eating){
      this.body.pop();
    }else{
      this.eating = false;
    }
    this.body.unshift(newBlock);
  }
  checkAction(){
    var head = this.body[0];
    if(
      head[0] < 0 ||
      head[0] >= this.getRoom().size ||
      head[1] < 0 ||
      head[1] >= this.getRoom().size
    ){
      this.kill();
      return;
    }
    if((this.getRoom().apple[0] == head[0]) && (this.getRoom().apple[1] == head[1])){
      this.eating = true;
      this.getRoom().newApplePos();
    }
    for(var i = 1; i < this.body.length; i++){
      if(head[0] == this.body[i][0] && head[1] == this.body[i][1]){
        this.kill();
        return;
      }
    }
    this.getRoom().walls.forEach(wall=>{
      if(head[0] == wall[0] && head[1] == wall[1]){
        this.kill();
        return;
      }
    });
    for(var i = 0; i < this.getRoom().snakes.length; i++){
      if(this.getRoom().snakes[i].uid == this.uid){
        continue;
      }
      this.getRoom().snakes[i].body.forEach((part,j)=>{
        if((part[0] == head[0]) && (part[1] == head[1])){
          if(j == 0){
            var enemySnakeScore = this.getRoom().snakes[i].body.length;
            var ourScore = this.body.length;
            if(enemySnakeScore > ourScore){
              this.kill();
              return;
            }else if(enemySnakeScore < ourScore){
              this.getRoom().snakes[i].kill()
            }else if(enemySnakeScore == ourScore){
              this.getRoom().snakes[i].kill();
              this.kill();
              return;
            }
          }else{
            this.kill();
            return;
          }
        }
      })
    }
    var time2 = performance.now();
  }
}
module.exports = {
  Snake
}