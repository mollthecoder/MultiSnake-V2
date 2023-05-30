const { generateName,sumArrays,oddsOf,pickColor } = require("../etc/helpers.js");
const { Snake } = require("../objects/snake.js");
const { manager } = require("../managers/roomManager.js");
const makePredictions = require("../../AI/makePredictions.js");

class AIBot extends Snake{
  constructor(uid,room,type){
    super(uid,generateName(),pickColor(), room,
              [Math.floor(Math.random() * (manager.getRoom(room).size*0.75)),Math.floor(Math.random() * (manager.getRoom(room).size*0.75))]
         );
    this.isBot = true;
    this.bot = true;
  }
  move(){
    this.getMove();
    var head = this.body[0];
    var newBlock = sumArrays(head,this.directionMap[this.direction]);
    if(!this.eating){
      this.body.pop();
    }else{
      this.eating = false;
    }
    this.body.unshift(newBlock);
  }
  getMove(){
    var matrix = [];
    var r = this.getRoom();
    for(var i = 0; i < r.size; i++){
      matrix[i] = [];
      for(var j = 0;j < r.size; j++){
        matrix[i][j] = 0;
      }
    }
  
    for(var i = 0; i < r.snakes.length; i++){
      r.snakes[i].body.forEach(part=>{
        matrix[part[0]][part[1]] = (r.snakes[i].uid == this.uid) ? 1 : 0.5;
      });
    }
    for(var i =0; i < r.walls.length; i++){
      matrix[r.walls[i][0]][r.walls[i][1]] = 0.25;
    }
    matrix[r.apple[0]][r.apple[1]] = 0.75;
    var preds = makePredictions(matrix)
    this.direction = preds[0];
  }
}
class Bot extends Snake{
  constructor(uid,room,type){
    super(uid,generateName(),pickColor(), room,
              [Math.floor(Math.random() * (manager.getRoom(room).size*0.75)),Math.floor(Math.random() * (manager.getRoom(room).size*0.75))]
         );
    this.minMistakesPerTickPercent = 0.8;
    this.isBot = true;
    this.bot = true;
    this.type = type;
    //this.pref01 = Math.round(Math.random());
    this.oddsOfMistakePerTick = 1 - ((Math.random() * (1-this.minMistakesPerTickPercent))+this.minMistakesPerTickPercent);
    this.inverseMap = {
      "up":"down",
      "down":"up",
      "left":"right",
      "right":"left"
    };
    this.shiftInverseMap = {
      "up":["right","left"],
      "down":["right","left"],
      "left":["up","down"],
      "right":["up","down"]
    }
  }
  move(){
    this.getMove();
    var head = this.body[0];
    var newBlock = sumArrays(head,this.directionMap[this.direction]);
    if(!this.eating){
      this.body.pop();
    }else{
      this.eating = false;
    }
    this.body.unshift(newBlock);
  }
  getMove(){
    var head = this.body[0];
    var apple = this.getRoom().apple;
    var walls = this.getRoom().walls;

    var dirToGo = this.direction;
    
    if(head[0] > apple[0]){
      dirToGo = "left"
    }else if(head[0] < apple[0]){
      dirToGo = "right";
    }else if(head[1] > apple[1]){
      dirToGo = "down";
    }else if(head[1] < apple[1]){
      dirToGo = "up";
    }

    if(this.direction == this.inverseMap[dirToGo]){
      this.direction = this.shiftInverseMap[dirToGo][Math.round(Math.random())];
    }else{
      this.direction = dirToGo;
    }

    this.direction = this.checkPathsAwayFrom(this.direction,0);
    var mistake = oddsOf(this.oddsOfMistakePerTick * 100);
    if(mistake){
      this.direction = Object.keys(this.inverseMap)[Math.floor(Math.random() * Object.keys(this.inverseMap).length)];

      if(this.direction == this.inverseMap[this.direction]){
        this.direction = this.shiftInverseMap[this.direction][Math.round(Math.random())];
      }
    }
  }
  checkPathsAwayFrom(direction,tries){
    if(tries < 4){
      var head = this.body[0]
      var forward = sumArrays(this.directionMap[direction],head);
      if(this.getRoom().is_block_occupied(forward) == "wall" || this.getRoom().is_block_occupied(forward) == "snake"){
        return this.checkPathsAwayFrom(this.shiftInverseMap[direction][Math.round(Math.random())],tries+1);
      }else{
        return direction
      }
    }else{
      return direction;
    }
  }
}

module.exports = {
  Bot
}