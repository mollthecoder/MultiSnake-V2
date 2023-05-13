const express = require('express');
const { json2array } = require("../etc/helpers.js");
const { manager } = require("../managers/roomManager.js");
const { resolve } = require("path");
const http = require('http');
const nunjucks = require("nunjucks");
const morgan = require("morgan");
const app = express();


const server = http.createServer(app);


app.use(morgan("dev"));

app.use(express.static(resolve("./src/server/public")));
nunjucks.configure(resolve("./src/server/views"), {
    autoescape: true,
    express: app
});



app.get("/",(req,res)=>{
  res.render("index.html");
});
app.get("/play/:room",(req,res)=>{
  res.render("play.html",{
    room: req.params.room
  });
});


app.get('/api/v1/rooms', (req, res) => {
  var reems = json2array(manager.rooms);
  reems = reems.map((reem) => {
    var snakesArray = json2array(reem.snakes);
    var reemSnakes = snakesArray.filter((snake) => {
      if (snake !== "dead_snake") {
        return true;
      } else {
        return false;
      }
    });
    return {
      "room_key": reem.key,
      "type": reem.type,
      "alive_snakes": reemSnakes,
      "snake_quantity": reemSnakes.length,
      "apple_pos": reem.apple,
      "current_obstacles": reem.obs,
      "room_size": reem.by,
    }
  })
  res.json(reems);
});




server.listen(3000, () => {
  console.log('Server Live');
});
module.exports = { server,app }