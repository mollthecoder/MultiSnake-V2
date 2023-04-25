const { generateName } = require("./helpers.js");


class Bot{
  constructor(gameType){
    this.type = gameType;
    this.name = generateName()
  }
  chooseMove(roomData)=>{
    
  }
}