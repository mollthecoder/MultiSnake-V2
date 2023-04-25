const { app } = require("./server/app.js");
const { io } = require("./server/webs.js");
const { Snake } = require("./objects/snake.js");
const { Room } = require("./objects/room.js");
var t = new Snake("1","Joe",new Room("23453erf","10"));
console.log(t.direction);
console.log(t.body);
t.move();
console.log(t.body);
