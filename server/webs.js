const { server } = require("./app.js");
const { Server } = require("socket.io");
const io = new Server(server);

io.on("connection",(socket)=>{
  console.log("New connection recieved");
});

module.exports = { io }