const { server } = require("./app.js");
const { Server } = require("socket.io");
const io = new Server(server);

module.exports = { io }