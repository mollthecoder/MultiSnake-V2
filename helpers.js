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
module.exports = {
  generateName,
  oddsOf,
  json2array
}