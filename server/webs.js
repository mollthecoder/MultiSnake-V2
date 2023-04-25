const { io } = require("./app.js");
console.log("hi")
io.on("connection",(socket)=>{
  console.log("New connection recieved");
});

module.exports = { io }