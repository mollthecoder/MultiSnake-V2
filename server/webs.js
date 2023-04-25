const { io } = require("./app.js");
io.on("connection",(socket)=>{
  console.log("New connection recieved");
});

module.exports = { io }