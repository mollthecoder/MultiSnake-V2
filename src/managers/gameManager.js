const { json2array,uid } = require("../etc/helpers.js")
const { emitBoard } = require("../server/eventListener.js");
const { manager } = require("./roomManager.js");
const { Bot } = require("../bots/bots.js");
class GameManager{
  constructor(m,t = 100){
    this.roomManager = m;
    this.tick = t;
  }
  __init__(){
    var time1 = performance.now();
    if(this.roomManager.ticking){
      var roomarray = json2array(this.roomManager.rooms);
      roomarray.forEach((room)=>{
        if(room.needsToBeDeleted){
          manager.deleteRoom(room.uid);
        }else{
          if(room.snakes.length < 3){
            var bot = new Bot(uid(),room.uid,"standard");
            room.addSnake(bot,true);
            manager.addSnake(bot,true);
          }
          room.tick();
          emitBoard(room,this.tick);
        }
      });
    }
    //console.log(performance.now() - time1);
    setTimeout(()=>{
      this.__init__();
    },this.tick);
  }
}

const server1GM = new GameManager(manager);
server1GM.__init__();
module.exports = {
  gameManager: server1GM
}