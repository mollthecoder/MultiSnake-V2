const {
	oddsOf,
	manhattanDistance,
	directionVector
} = require("../etc/helpers.js");
const {
	Snake
} = require("./snake.js");
const {
	emitDeath,
	emitWin
} = require("../server/eventListener.js");
const { dbManager } = require("../managers/databaseManager.js");

class Room {
	constructor(uid, size, friendly, winCondition) {
		this.name = friendly;
		this.uid = uid;
		this.size = size;
		this.snakes = [];
		this.walls = [];
		this.lastTouched = new Date().getTime()
		var randomX = Math.floor(Math.random() * this.size);
		var randomY = Math.floor(Math.random() * this.size);
		this.apple = [randomX, randomY];
		this.needsToBeDeleted = false;
		this.winCondition = winCondition;
		this.creationTime = new Date().getTime();
		this.winAnnounced = false
	}
	async tick() {
		if (this.walls.length > (this.size * this.size * 1 / 4)) {
			this.reset();
		}
		if ((new Date().getTime() - this.lastTouched) / 1000 / 60 > 1) {
			this.reset();
			this.needToBeDeleted = true;
		} else {
			for (var snake of this.snakes) {
				if (!snake.isBot) {
					this.lastTouched = new Date().getTime();
				}
				if (snake.body.length >= this.winCondition && !this.winAnnounced) {
					this.winAnnounced = true
					emitWin(this.uid, snake.uid);
					if (snake.loggedIn) {
						await dbManager.playGame(snake.uid);
						await dbManager.winGame(snake.uid, new Date().getTime() - snake.creationTime);
					}
					this.reset();
					break;

				}
				snake.move();
				snake.checkAction();
			};
		}
	}
	async killSnake(uid) {
		var pickedSnake = {};
		this.snakes = this.snakes.filter(snake => {
			if (snake.uid == uid) {
				pickedSnake = snake
				return false;
			} else {
				return true;
			}
		});

		emitDeath(this.uid, pickedSnake.uid);
		if (pickedSnake.loggedIn) {
			await dbManager.playGame(pickedSnake.uid);
		}
	}
	reset() {
		this.snakes = [];
		this.walls = [];
		this.apple = this.newApplePos();
		this.creationTime = new Date().getTime()
	}
	addSnake(snake) {
		if (!snake.isBot) {
			this.lastTouched = new Date().getTime();
		}
		this.snakes.push(snake);
	}
	optimalNextSpawn() {
		var matrix = this.generateMatrix();
		var gradientMap = this.gradient(matrix, 4);
		var lowest = 1;
		var bestPoint = [];

		for (var y = 0; y < gradientMap.length; y++) {
			for (var x = 0; x < gradientMap[y].length; x++) {
				if (gradientMap[y][x] < lowest) {
					lowest = gradientMap[y][x];
					bestPoint = [x, y];
				}
			}
		}

		var directions = ["up", "down", "left", "right"];
		var bestDirection = null;
		var lowestSum = Infinity;

		for (var i = 0; i < directions.length; i++) {
			var sum = 0;
			var dx = 0;
			var dy = 0;

			switch (directions[i]) {
				case "up":
					dy = -1;
					break;
				case "down":
					dy = 1;
					break;
				case "left":
					dx = -1;
					break;
				case "right":
					dx = 1;
					break;
			}

			for (var j = 1; j <= 5; j++) {
				var ny = bestPoint[0] + j * dy;
				var nx = bestPoint[1] + j * dx;

				if (ny >= 0 && ny < gradientMap.length && nx >= 0 && nx < gradientMap[0].length) {
					sum += gradientMap[ny][nx];
				}
			}

			if (sum < lowestSum) {
				lowestSum = sum;
				bestDirection = directions[i];
			}
		}
		return {
			point: bestPoint,
			direction: bestDirection,
			gradientMap
		}
	}

	newApplePos() {
		var newAppleX = Math.round((Math.random() * (this.size - 2 - 1)) + 1);
		var newAppleY = Math.round((Math.random() * (this.size - 2 - 1)) + 1);
		if (this.is_block_occupied([newAppleX, newAppleY])) {
			return this.newApplePos();
		} else {
			this.apple = [newAppleX, newAppleY]
			return [newAppleX, newAppleY]
		}
	}
	getApplePos() {
		return this.apple;
	}
	dump() {
		return {
			uid: this.uid,
			snakes: this.snakes,
			walls: this.walls,
			type: this.type,
			apple: this.apple,
			name: this.name,
			size: this.size
		}
	}
	is_block_occupied(target) {
		var foundblocks = this.walls.some(wall => {
			return (
				target[0] == wall[0] && target[1] == wall[1]
			)
		});
		var snakeFoundBlocks = this.snakes.some(snake => {
			return snake.body.some(part => {
				return (
					target[0] == part[0] && target[1] == part[1]
				)
			})
		})
		var appleOccupies = (target[0] == this.apple[0] && target[1] == this.apple[1]);
		if (appleOccupies) {
			return "apple"
		} else if (foundblocks) {
			return "wall"
		} else if (snakeFoundBlocks) {
			return "snake"
		} else {
			return false;
		}
	}
	generateMatrix() {
		var [snakes, walls, size] = [this.snakes, this.walls, this.size];
		const matrix = new Array(size).fill(null).map(() => new Array(size).fill(0));

		// assign a 1 value to each body part coordinate of each snake
		for (const snake of snakes) {
			for (const bodyPart of snake.body) {
				const x = bodyPart[0];
				const y = bodyPart[1];
				matrix[y][x] = 1;
			}
		}

		// assign a 1 value to each wall coordinate
		for (const wall of walls) {
			const x = wall[0];
			const y = wall[1];
			matrix[y][x] = 1;
		}

		// assign a 1 value to every border point on the matrix
		for (let i = 0; i < size; i++) {
			matrix[0][i] = 1;
			matrix[size - 1][i] = 1;
			matrix[i][0] = 1;
			matrix[i][size - 1] = 1;
		}

		return matrix;
	}
	gradient(mat, x) {
		const temp = JSON.parse(JSON.stringify(mat)); // create a temporary matrix as a copy of mat
		const size = mat.length;

		for (let i = 0; i < x; i++) {
			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					if (mat[y][x] === 0) {
						let sum = 0;
						let count = 0;
						for (let yOffset = -1; yOffset <= 1; yOffset++) {
							for (let xOffset = -1; xOffset <= 1; xOffset++) {
								const xCoord = x + xOffset;
								const yCoord = y + yOffset;
								if (xCoord >= 0 && xCoord < size && yCoord >= 0 && yCoord < size && mat[yCoord][xCoord] !== 0) {
									sum += mat[yCoord][xCoord];
									count++;
								}
							}
						}
						if (count > 0) {
							temp[y][x] = sum / 8;
						}
					}
				}
			}
			mat = JSON.parse(JSON.stringify(temp)); // update mat to the updated temporary matrix
		}

		return mat;
	}
	scale2board(number) {
		return Math.min(Math.max(0, number), this.size - 2);
	}
}
class Classic extends Room{
	constructor(uid,friendly){
		super(uid,25,friendly,10)
	}
}
class Standard extends Room {
	constructor(uid, friendly) {
		super(uid, 25, friendly, 10);
		this.eatenUntilNextWall = 5;
		this.baseEatenUntilNextWall = this.eatenUntilNextWall;
	}
	// This function generates a new position for an apple in a two-dimensional grid.

	newApplePos() {
		// Generate a random X coordinate between 1 and the size of the grid minus 2
		var newAppleX = Math.round((Math.random() * (this.size - 2 - 1)) + 1);

		// Generate a random Y coordinate between 1 and the size of the grid minus 2
		var newAppleY = Math.round((Math.random() * (this.size - 2 - 1)) + 1);

		// Check if the new apple position is already occupied by a block
		if (this.is_block_occupied([newAppleX, newAppleY])) {
			// If the new position is occupied, call the function recursively to find a new position
			return this.newApplePos();
		} else {
			// If the new position is not occupied, set the position of the apple object to the new position
			this.apple = [newAppleX, newAppleY];

			// Check if it is time to spawn a new wall
			if (--this.eatenUntilNextWall <= 0) {
				// If the number of apples eaten since the last wall spawn is equal to or less than zero, call the spawnWall() function to create a new wall
				this.spawnWall();
				this.eatenUntilNextWall = this.baseEatenUntilNextWall;
			}

			// Return an array of the new apple's X and Y coordinates
			return [newAppleX, newAppleY];
		}
	}

	spawnWall() {
		if (this) {
			if (oddsOf(75)) {
				// spawn block in a random location
				if (!this.walls[0]) {
					var blockX = Math.round((Math.random() * (this.size - 2 - 1)) + 1);
					var blockY = Math.round((Math.random() * (this.size - 2 - 1)) + 1);
					if (!this.is_block_occupied([blockX, blockY])) {
						this.walls.push([blockX, blockY])
					} else {
						// block already exists. try again.
						this.spawnWall();
					}
				} else {
					// spawn a block next to an existing block.
					var side = Math.round(Math.random() * 3);
					var pickedblock = this.walls[Math.floor(Math.random() * this.walls.length)];
					var newblock = [];
					switch (side) {
						case 0:
							newblock[0] = pickedblock[0];
							newblock[1] = this.scale2board(pickedblock[1] - 1);
							if (!this.is_block_occupied([newblock[0], newblock[1]])) {
								this.walls.push([newblock[0], newblock[1]]);
							} else {
								this.spawnWall()
							}
							break;
						case 1:

							newblock[0] = pickedblock[0];
							newblock[1] = this.scale2board(pickedblock[0] - 1);
							if (!this.is_block_occupied([newblock[0], newblock[1]])) {
								this.walls.push([newblock[0], newblock[1]]);
							} else {
								this.spawnWall()
							}
							break;
						case 2:
							newblock[0] = pickedblock[0];
							newblock[1] = this.scale2board(pickedblock[1] + 1);
							if (!this.is_block_occupied([newblock[0], newblock[1]])) {
								this.walls.push([newblock[0], newblock[1]]);
							} else {
								this.spawnWall();
							}
							break;
						case 3:
							newblock[0] = pickedblock[0];
							newblock[1] = this.scale2board(pickedblock[0] + 1);
							if (!this.is_block_occupied([newblock[0], newblock[1]])) {
								this.walls.push([newblock[0], newblock[1]]);
							} else {
								this.spawnWall()
							}
							break;
					}
				}
			} else {
				// no walls exist yet... spawn one in a random location
				var blockX = Math.round((Math.random() * (this.size - 2 - 1)) + 1);
				var blockY = Math.round((Math.random() * (this.size - 2 - 1)) + 1);
				if (!this.is_block_occupied[blockX, blockY], this) {
					this.walls.push([blockX, blockY])
				} else {
					this.spawnWall()
				}
			}
		}
	}
}
class Small extends Room {
	constructor(uid, friendly) {
		super(uid, 15, friendly, 5);
	}
}
module.exports = {
	Room: Standard,
	Classic: Room,
	Small,
	hashMap: {
		"standard":Standard,
		"small":Small,
		"classic":Room
	}
}