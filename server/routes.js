const express = require("express");
const { rooms } = require("../roomManager.js");
const { json2array } = require("../helpers.js");
const router = express.Router();

router.get("/",(req,res)=>{
  res.render("index.html");
});
router.get("/play/:room",(req,res)=>{
  res.render("play.html",{
    room: req.params.room
  });
});


router.get('/api/v1/rooms', (req, res) => {
  var reems = json2array(rooms);
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

module.exports = router;