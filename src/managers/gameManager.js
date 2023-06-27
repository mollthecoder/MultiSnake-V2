const { json2array, guid } = require("../etc/helpers.js")
const { emitBoard } = require("../server/eventListener.js");
const { manager } = require("./roomManager.js");
const { Bot } = require("../bots/bots.js");




class GameManager {
  constructor(m, t = 200) {
    this.roomManager = m;
    this.tick = t;
    this.workers = []; // Store the worker instances
  }
  async __init__() {
    if (this.roomManager.ticking) {
      var roomarray = json2array(this.roomManager.rooms);

      for (var i = 0; i < roomarray.length; i++) {
        var room = roomarray[i];

        if (room.needsToBeDeleted) {
          manager.deleteRoom(room.uid);
        } else {
          if (room.snakes.length < 3) {
            var bot = new Bot(guid(), room.uid, "standard");
            room.addSnake(bot, true);
            manager.addSnake(bot, true);
          }
          room.tick();
          emitBoard(room,this.tick);
        }
      }
    }
    setTimeout(() => {
      this.__init__();
    }, this.tick);
  }
}

const server1GM = new GameManager(manager);
server1GM.__init__();
module.exports = {
  gameManager: server1GM,
}