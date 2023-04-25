var { oddsOf } = require("../helpers.js");
var { Wall } = require("./wall.js")
class Room{
  constructor(uid,size){
    this.key = uid;
    this.uid = uid;
    this.size = size;
    this.snakes = [];
    this.walls = [];
    var randomX = Math.floor(Math.random() * this.size);
    var randomY = Math.floor(Math.random() * this.size);
    this.apple = [randomX,randomY];
  }
  tick(){
    this.snakes.forEach(snake=>{
      snake.move();
      snake.checkAction();
    })
  }
  killSnake(uid){
    this.snakes = this.snakes.filter(snake=>{
      if(snake.uid == uid){
        return false;
      }else{
        return true;
      }
    })
  }
  reset(){
    this.snakes = [];
    this.walls = [];
    this.apple = this.newApplePos();
  }
  addSnake(snake){
    this.snakes.push(snake);
  }
  newApplePos(){
    var newAppleX = Math.round((Math.random() * (this.size - 2 - 1)) + 1);
    var newAppleY = Math.round((Math.random() * (this.size - 2 - 1)) + 1);
    if (this.is_block_occupied([newAppleX, newAppleY])) {
      return this.getNewApplePos()
    } else {
      this.apple = [newAppleX, newAppleY]
      return [newAppleX, newAppleY]
    }
  }
  getApplePos(){
    return this.apple
  }
  dump(){
    return {
      key: this.key,
      snakes: this.snakes,
      walls: this.walls,
      type: this.type,
      apple: this.apple
    }
  }
  is_block_occupied(target) {
    var foundblocks = this.walls.find((elem) => {
      var element = elem.position;
      return (
        (target[0] == element[0] && target[1] == element[1])
      )
    });
    var snakeFoundBlocks = this.snakes.find(snake=>{
      var snakeLength = snake.body.map(part=>{
        return (
          (target[0] == part[0] && target[1] == part[1])
        )
        return (snakeLength.length >= 1)
      })
    });
    var appleOccupies = (target[0] == this.apple[0] && target[1] == this.apple[1])
    return (foundblocks.length >= 1 || appleOccupies) ? true : false;
  }
  scale2board(number) {
    return Math.min(Math.max(1, number), this.size - 2);
  }
}
class Standard extends Room{
  constructor(uid,size){
    super(uid,size);
    this.type = "standard";
  }
  tick(){
    this.spawnBlock();
    this.snakes.forEach(snake=>{
      snake.move();
      snake.checkAction();
    })
  }
  spawnBlock() {
    if (oddsOf(0.75)) {
      // spawn block in a random location
      if (!this.walls[0]) {
        var blockX = Math.round((Math.random() * (this.size - 2 - 1)) + 1);
        var blockY = Math.round((Math.random() * (this.size - 2 - 1)) + 1);
        if (!this.is_block_occupied([blockX, blockY])) {
          this.createWallAt([blockX, blockY])
        } else {
          // block already exists. try again.
          this.spawnBlock();
        }
      } else {
        // spawn a block next to an existing block.
        var side = Math.round(Math.random() * 3);
        var pickedblock = this.walls[Math.floor(Math.random() * this.walls.length)];
        var newblock = [];
        switch (side) {
          case 0:
            newblock[0] = pickedblock[0];
            newblock[1] = scale2board(pickedblock[1] - 1);
            if (!is_block_occupied([newblock[0], newblock[1]])) {
              this.createWallAt([newblock[0], newblock[1]]);
            } else {
              this.spawnBlock()
            }
            break;
          case 1:

            newblock[0] = pickedblock[0];
            newblock[1] = scale2board(pickedblock[0] - 1);
            if (!is_block_occupied([newblock[0], newblock[1]])) {
              this.createWallAt([newblock[0], newblock[1]]);
            } else {
              this.spawnBlock()
            }
            break;
          case 2:
            newblock[0] = pickedblock[0];
            newblock[1] = scale2board(pickedblock[1] + 1);
            if (!is_block_occupied([newblock[0], newblock[1]])) {
              this.createWallAt([newblock[0], newblock[1]]);
            } else {
              this.spawnBlock();
            }
            break;
          case 3:

            newblock[0] = pickedblock[0];
            newblock[1] = scale2board(pickedblock[0] + 1);
            if (!is_block_occupied([newblock[0], newblock[1]])) {
              this.createWallAt([newblock[0], newblock[1]]);
            } else {
              this.spawnBlock()
            }
            break;
        }
      }
    } else {
      // no blocks exist yet... spawn one in a random location
      var blockX = Math.round((Math.random() * (this.size - 2 - 1)) + 1);
      var blockY = Math.round((Math.random() * (this.size - 2 - 1)) + 1);
      if (!is_block_occupied([blockX, blockY])) {
        this.createWallAt([blockX, blockY])
      } else {
        this.spawnBlock()
      }
    }
  }
  createWallAt(position){
    var wall = new Wall(position[0],position[1]);
    this.walls.push(wall)
  }
}

module.exports = { Room, Standard }