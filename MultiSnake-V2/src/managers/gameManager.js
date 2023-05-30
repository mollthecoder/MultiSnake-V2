const { json2array,uid } = require("../etc/helpers.js")
const { emitBoard } = require("../server/eventListener.js");
const { manager } = require("./roomManager.js");
const { Bot } = require("../bots/bots.js");
const { Database } = require("@sojs_coder/sodb");

var playDB = new Database("playDB",{
  encrypt: false,
  timeToCompress: 48
});



class GameManager{
  constructor(m,t = 200){
    this.roomManager = m;
    this.tick = t;
  }
  async __init__(){
    var time1 = performance.now();
    if(this.roomManager.ticking){
      var roomarray = json2array(this.roomManager.rooms);
      for(var i = 0; i < roomarray.length; i++){
        var room = roomarray[i];
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
          // await mapData(room);
        }
      }
    }
    //console.log(performance.now() - time1);
    setTimeout(()=>{
      this.__init__();
    },this.tick);
  }
}
async function mapData(r){
  var matrix = [];
  var turnMove = null;
  var pickedSnake = r.snakes.filter((snake)=>{
    return (!snake.isBot);
  });
  pickedSnake = pickedSnake[Math.floor(Math.random() * pickedSnake.length)];
  if(pickedSnake){
    pickedSnake = pickedSnake.uid;
  
    
    var noted = false;
    for(var i = 0; i < r.size; i++){
      matrix[i] = [];
      for(var j = 0;j < r.size; j++){
        matrix[i][j] = 0;
      }
    }
  
    for(var i = 0; i < r.snakes.length; i++){
      if(!noted && !r.snakes[i].isBot){
        noted = r.snakes[i].uid;
      }
      if(!r.snakes[i].isBot && (noted == r.snakes[i].uid)){
        turnMove = r.snakes[i].direction;
      }
      
      r.snakes[i].body.forEach(part=>{
        matrix[part[0]][part[1]] = (!r.snakes[i].isBot && (noted == r.snakes[i].uid)) ? 1 : 0.5;
      });
    }
    for(var i =0; i < r.walls.length; i++){
      matrix[r.walls[i][0]][r.walls[i][1]] = 0.25;
    }
    matrix[r.apple[0]][r.apple[1]] = 0.75;
    var t1 = performance.now()
    var data = await playDB.getDoc("games")
    if(!data[r.uid]){
      data[r.uid] = {
        game: [],
        moves: []
      }
    }
    data[r.uid].game.push(matrix);
    data[r.uid].moves.push(turnMove);
    return new Promise((resolve,reject)=>{
      playDB.updateDoc("games",data).then(()=>{
        var t2 = performance.now();
        
        console.log(`DATABASE UPDATED IN ${((t2- t1)/1000).toFixed(3)} seconds (${t2-t1} milliseconds)` );
        resolve(matrix);
      }).catch(reject)
    })
  }else{
    return "No player snake active"
  }
}
const server1GM = new GameManager(manager);
server1GM.__init__();
module.exports = {
  gameManager: server1GM,
  mapData
}