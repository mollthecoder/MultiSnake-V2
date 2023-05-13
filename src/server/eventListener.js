const { io } = require("./webs.js");

function emitBoard(room,tick_speed){
  io.to(room.uid).emit("board_request_respond",{ ...room.dump(),tick: tick_speed });
}
function emitDeath(roomID, snakeID){
  io.to(roomID).emit("snake_death",{uid:snakeID});
}
function emitWin(roomID,snakeID){
  io.to(roomID).emit("win",{uid:snakeID});
}
module.exports = {
  emitDeath,
  emitBoard,
  emitWin
}