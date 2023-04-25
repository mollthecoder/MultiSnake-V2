const { sumArrays } = require("../helpers.js");
class Snake{
  constructor(uid,name,room){
    this.uid = uid;
    this.name = name;
    var randomX = Math.floor(Math.random() * room.size);
    var randomY = Math.floor(Math.random() * room.size);
    this.body = [[randomX,randomY]];
    this.direction = ["up","down","left","right"][Math.floor(Math.random() * 4)];
    this.directionMap = {
      "up":[0,1],
      "down":[0,-1],
      "left":[-1,0],
      "right":[1,0]
    }
    this.score = this.body.length;
    this.speed = 0;
    this.room = room;
    this.eating = false
  }
  kill(){
    this.room.killSnake(this.uid);
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
      this.eating = false;
    }
    this.body.unshift(newBlock);
  }
  checkAction(){
    var head = this.body[0];
    if((room.apple[0] == head[0]) && (room.apple[1] == head[1])){
      this.eating = true;
      this.room.newApplePos();
    }
    for(var i = 0; i < room.snakes.length; i++){
      if(room.snakes[i].uid == this.uid) continue;
      room.snakes[i].body.forEach((part,j)=>{
        if((part[0] == head[0]) && (part[1] == head[1])){
          if(j == 0){
            var enemySnakeScore = room.snakes[i].body.length;
            var ourScore = this.body.length;
            if(enemySnakeScore > ourScore){
              this.kill()
            }else if(enemySnakeScore < ourScore){
              room.snakes[i].kill()
            }else if(enemySnakeScore == ourScore){
              room.snakes[i].kill();
              this.kill();
            }
          }else{
            this.kill();
          }
        }
      })
    }
  }
}
module.exports = {
  Snake
}