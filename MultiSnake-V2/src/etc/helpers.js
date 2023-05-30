const {randomUUID} = require("crypto");
function generateName() {
  var start = [
    'flying',
    'blue',
    'pink',
    'jumping',
    'invisible',
    'red',
    'dancing',
    'running',
    'yellow'
  ];
  var end = [
    'Tangerine',
    'Orange',
    'Helicopter',
    'Snake',
    'Toad',
    'Ninja',
    'Goose',
    'Banana',
    'Duck'
  ];
  var ending = start[Math.floor(Math.random() * start.length)] + end[Math.floor(Math.random() * end.length)] + Math.round(Math.random() * 100);
  return ending;
}
function pickColor(){
  var colors = [
    "red",
    "orange",
    "green",
    "blue",
    "purple",
    "white",
    "lightgreen",
    "yellow",
    "pink",
    "coral",
    "lightblue",
    "deepskyblue",
    "greenyellow",
    "darkorange"
  ]
  return colors[Math.floor(Math.random() * colors.length)];
}
function oddsOf(percent) {
  let odd = percent/100;
  return (Math.random() < odd)
}
function json2array(json) {
  var result = [];
  var keys = Object.keys(json);
  keys.forEach(function(key) {
    var endJSON = json[key];
    endJSON.key = key
    result.push(endJSON);
  });
  return result;
}
function sumArrays(...arrays) {
  const n = arrays.reduce((max, xs) => Math.max(max, xs.length), 0);
  const result = Array.from({ length: n });
  return result.map((_, i) => arrays.map(xs => xs[i] || 0).reduce((sum, x) => sum + x, 0));
}
const uid = () => {
  return randomUUID();
};
function manhattanDistance(point1, point2) {
  return Math.abs(point1[0] - point2[0]) + Math.abs(point1[1] - point2[1]);
}


function directionVector(direction) {
  switch (direction) {
    case "up":
      return [0, -1];
    case "down":
      return [0, 1];
    case "left":
      return [-1, 0];
    case "right":
      return [1, 0];
    default:
      throw new Error(`Invalid direction: ${direction}`);
  }
}
function generateAPIKey() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let apiKey = '';

  for (let i = 0; i < 32; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    apiKey += characters.charAt(randomIndex);
  }

  return apiKey;
}
function rand(digits) {
  return Math.floor(Math.random() * parseInt('8' + '9'.repeat(digits - 1)) + parseInt('1' + '0'.repeat(digits - 1)));
}

module.exports = {
  generateName,
  oddsOf,
  json2array,
  sumArrays,
  uid,
  pickColor,
  manhattanDistance,
  directionVector,
  generateAPIKey,
  rand
}