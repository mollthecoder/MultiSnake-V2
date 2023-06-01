// GAME DATA //
var room = window.room;
var user = window.user;
var socket = window.socket
var username = (user && user.username) ? user.username : localStorage.username;
var canvas = document.querySelectorAll("canvas")[0];
var ctx = canvas.getContext("2d");
var lastDrawTime = performance.now();
var ping = performance.now();
var fpsBuffer = [];
var pingBuffer = [];
var pDiff = 0;
var player = null;
var BLOCK_SIZE = 25;
var updateInterval = 150; // milliseconds between server updates;
var lastUpdateTime = performance.now();
var currDirection = "right";
var directionalQueue = [];
var directionChanging = false;
var playerSnakeRef = null;
var api_key = null;
var spawnZone = {
  time: false,
  point: false
};
var keyMap = {
  38: "down",
  87: "down",
  83: "up",
  40: "up",
  37: "left",
  65: "left",
  68: "right",
  39: "right"
}
var inverseMap = {
  "up":"down",
  "down":"up",
  "left":"right",
  "right":"left"
}
var directionMap = {
  "up":[0,1],
  "down":[0,-1],
  "left":[-1,0],
  "right":[1,0]
}
var directionToRadian = {
  "up":Math.PI/2,
  "down":(3*Math.PI)/2,
  "right":0,
  "left":Math.PI
}
var board = {
  snakes: [],
  walls: [],
  apple: [],
  size: 0,
};
var winScreenDisplayed = false;
var spectateScreen = {
  title: "Join Game",
  small: "Click 'spawn' to spawn in, and 'spectate' to spectate"
}

// SPAWNING
function startSpawnSequence(){
  socket.emit("request_optimal_spawn",{
    room,
    player
  });
}
function join(){
  socket.emit("join_request",{
    room,
    api_key,
    uidPlease: (user) ? user.uid : false
  });
  
}
socket.on("join_request_respond",(data)=>{
  if(!player){
    player = data.uid;
  }
  // BLOCK_SIZE = data.room.size
  canvas.width = (data.room.size)*BLOCK_SIZE;
  canvas.height = (data.room.size)*BLOCK_SIZE;
  startSpawnSequence();
});
socket.on("optimal_spawn",(data)=>{
  var coords = data.optimal_spawn;
  spawnZone = {
    point: coords.point,
    direction: coords.direction,
    gradient: coords.gradientMap,
    time: Date.now()
  }
  setTimeout(()=>{
    socket.emit("spawn_request",{
      room,
      username,
      spawn: {
        point: spawnZone.point,
        direction: spawnZone.direction,
      }
    });
  },3000);
});

// NON GAME CRITICAL //
socket.on("error",handleError);

function handleError(error){
  displayNotif("Error code "+error.code + ": " +error.message,"red");
  console.error(error);
  setTimeout(()=>{
    switch (error.code){
      case 100:
        displayNotif("Please close any other multisnake tabs");
        break;
      case 101: 
        displayNotif("Your session is no longer valid. Refresh your page");
        break;
      case 102:
        displayNotif("Something went wrong... try refreshing your page");
        break;
    }
    var level = Math.floor(error.code/100);
    switch(level){
      case 1:
        if(confirm("This error can be solved by refreshing. This page will refresh automatically when you click OK. \nIf the error persists, click cancel and contact the developer. Include the error code, message, and any console logs in the report")){
          location.reload();
        }else{
          displayNotif("Refreshing canceled. CTRL+SHIFT+I to read console output & access logs");
        }
        break;
      case 2:
        displayNotif("If this error persists, try refreshing the page");
        break;
      default:
        displayNotif("An unkown error was thrown that can not be handled. That's really bad. Something probably is broken")
    }
    
  },1000);
  
}
function updateLeaders(snakes){
  var ulRef = document.getElementById("leaders");
  ulRef.innerHTML = "";
  document.getElementById("apples").innerHTML = (playerSnakeRef) ? playerSnakeRef.body.length : "...";
  snakes = snakes.sort((a,b)=>{
    if(a.body.length > b.body.length){
      return -1;
    }else if(a.body.length < b.body.length){
      return 1;
    }else{
      return 0;
    }
  });
  snakes.forEach(snake=>{
    var addText = "";
    var li = document.createElement("li");
    if(snake.uid == player){
      li.classList.add("player");
    };
    if(snake.loggedIn && snake.uid !== player){
        addText = "✅";
        var usernameLink = "/account/"+snake.uid;
        var a = document.createElement("a");
        a.style.color = "white";
        a.style.textDecoration = "underline";
        a.href = usernameLink;
        var playerTextNode = document.createTextNode(snake.name + addText);

        a.appendChild(playerTextNode);
        li.appendChild(a)
    }else{
      var text = document.createTextNode(snake.name);
      li.appendChild(text);
    }
    
    var text = document.createTextNode(": "+ snake.body.length);
    li.appendChild(text);
    ulRef.appendChild(li);
  });
}

// GRADIENT VISUALIZATION //
function inverseGradient(mat){
  var mat = mat.map(row=>{
    return row.map(point=>{
      return 1-point;
    });
  });
}
function generateRGBMatrix(matrix) {
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const rgbMatrix = new Array(numRows);
  
  for (let i = 0; i < numRows; i++) {
    rgbMatrix[i] = new Array(numCols);
    
    for (let j = 0; j < numCols; j++) {
      const value = matrix[j][i];
      const redValue = Math.round(value * 255);
      const blueValue = Math.round((1 - value) * 255);
      rgbMatrix[i][j] = `rgba(${redValue}, 0, ${blueValue},0.67)`;
    }
  }
  
  return rgbMatrix;
}

// DRAW HELPERS //
function sumArrays(...arrays) {
  const n = arrays.reduce((max, xs) => Math.max(max, xs.length), 0);
  const result = Array.from({ length: n });
  return result.map((_, i) => arrays.map(xs => xs[i] || 0).reduce((sum, x) => sum + x, 0));
}
function drawArrow(x1, y1, x2, y2, t = 0.9) {
  	const arrow = {
        dx: x2 - x1,
        dy: y2 - y1
    };
  	const middle = {
        x: arrow.dx * t + x1,
        y: arrow.dy * t + y1
    };
    const tip = {
        dx: x2 - middle.x,
        dy: y2 - middle.y
    };
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(middle.x, middle.y);
  ctx.moveTo(middle.x + 0.5 * tip.dy, middle.y - 0.5 * tip.dx);
  ctx.lineTo(middle.x - 0.5 * tip.dy, middle.y + 0.5 * tip.dx);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.stroke();
};
function drawGrid(startX, startY, endX, endY, gridCellSize) {
  ctx.beginPath();
  ctx.lineWidth = 1;

  for (x = startX; x <= endX; x += gridCellSize) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }

  for (y = startY; y <= endY; y += gridCellSize) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }

  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
  ctx.closePath();
  for(x = 0; x<= endX/gridCellSize; x++){
    for(y = 0; y<= endY/gridCellSize; y++){
      ctx.font = "8px Arial";
      ctx.fillText(`${x}|${y}`,x*gridCellSize+(gridCellSize*0.25), y*gridCellSize-(gridCellSize * 0.25));
    }
  }
}
function scrollToBottom(element) {
  element.scroll({ top: element.scrollHeight, behavior: 'smooth' });
}

// GAME SCREENS //
function drawBoard(){
  try {
    var snakes = board.snakes;
    var walls = board.walls || [];
    var apple = board.apple;
    var size = board.size || 0;
    for(var i = 0; i < snakes.length; i++){
      var snake = snakes[i];
      if(snake.uid == player){
        ctx.fillStyle = "green";
        playerSnakeRef = snake;
      } else {
        ctx.fillStyle = "yellow";
      }
      for(var j = snake.body.length-1; j >= 0; j--){
        var part = snake.body[j];
        var nextPos;
        if(j == 0){
          nextPos = snake.body[0];
          ctx.fillStyle = (snake.uid == player) ? ((username == "dev") ? "rgba(91, 255, 91	,0.5)" : "#5bff5b") : ((username == "dev") ? "rgba(255, 255, 0,0.5)" : "#FFFF00");
        }else{
          nextPos = snake.body[j-1];
          ctx.fillStyle = (snake.uid == player)? ((username == "dev") ? "rgba(0,128,0,0.5)" : "green") : ((username == "dev") ? "rgba(255, 165, 0,0.5)" : "#FFA500");
        }
        var x = part[0]*BLOCK_SIZE + BLOCK_SIZE/2;
        var y = part[1]*BLOCK_SIZE + BLOCK_SIZE/2;
        ctx.beginPath();
        ctx.arc(x, y, BLOCK_SIZE/2, 0, 2 * Math.PI);
        ctx.fill();
        for(var k = 1; k <= 25; k++){
          var dx = (nextPos[0] - part[0]) * k / 25;
          var dy = (nextPos[1] - part[1]) * k / 25;
          var x2 = (part[0] + dx) * BLOCK_SIZE + BLOCK_SIZE/2;
          var y2 = (part[1] + dy) * BLOCK_SIZE + BLOCK_SIZE/2;
          ctx.beginPath();
          ctx.arc(x2, y2, BLOCK_SIZE/2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(apple[0]*BLOCK_SIZE + BLOCK_SIZE/2, apple[1]*BLOCK_SIZE + BLOCK_SIZE/2, BLOCK_SIZE/2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = (username == "dev") ? "rgba(255,255,255,0.5)" : "white";
    walls.forEach((wall)=>{
      ctx.fillRect(wall[0] * BLOCK_SIZE, wall[1] * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    })
  } catch(err) {
    console.log(err);
  }
  if(type !== "small"){
    var fps = calculateFPS();
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`FPS: ${fps.toFixed(0)}`, canvas.width - 150, 30);
    ctx.fillText(`Ping: ${pDiff.toFixed(0)}ms`, canvas.width - 150,50);
  }
  if(username == "dev"){
    drawGrid(0,0,canvas.width,canvas.height,BLOCK_SIZE);
  }
  if(spawnZone.time && spawnZone.point && (Date.now() - spawnZone.time)/1000 <= 3){
    ctx.fillStyle = "rgba(255,100,100,0.7)"
    ctx.beginPath();
    ctx.arc(spawnZone.point[0]*BLOCK_SIZE + BLOCK_SIZE/2,spawnZone.point[1]*BLOCK_SIZE + BLOCK_SIZE/2,BLOCK_SIZE*2,0,Math.PI * 2)
    ctx.fill()
    var direction = spawnZone.direction;

    // add arrow facing direction at the point
    ctx.save();
    ctx.translate(spawnZone.point[0]*BLOCK_SIZE + BLOCK_SIZE/2, spawnZone.point[1]*BLOCK_SIZE + BLOCK_SIZE/2);
    ctx.rotate(directionToRadian[direction]);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(-BLOCK_SIZE/2, -BLOCK_SIZE/4);
    ctx.lineTo(BLOCK_SIZE/2, 0);
    ctx.lineTo(-BLOCK_SIZE/2, BLOCK_SIZE/4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if(username == "dev"){
      var RGBS = generateRGBMatrix(spawnZone.gradient)
      for(var i = 0; i < RGBS.length; i++){
        for(var j = 0; j < RGBS[i].length; j++){
          var r = 255;
          var g = 165;
          var b = 0;
          var a = 1;

          ctx.fillStyle = RGBS[i][j];
          ctx.fillRect(i*BLOCK_SIZE,j*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
        }
      }
    }
    
  }

}
function displaySpectateScreen(title,phrase){
  winScreenDisplayed = true;
  spectateScreen.title = title;
  spectateScreen.small = phrase;
}
function drawSpectateScreen() {

  // Draw the title and subtitle of the spectate screen
  ctx.fillStyle = 'white';
  ctx.font = '48px sans-serif';
  ctx.fillText(spectateScreen.title, canvas.width / 4, canvas.height / 3 - 50, canvas.width - 20);

  for (var i = 0; i <1; i++){
    // Get a random position for the small text
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = Math.random() * (canvas.height - 100) + 50;
  
    // Draw the small text at the random position
    ctx.font = '24px sans-serif';
    ctx.fillStyle = "rgba(255,255,255,0.8);"
    ctx.fillText(spectateScreen.small, x, y);

  }
  ctx.font = '15px sans-serif';
  ctx.fillText('Click anywhere to spawn in', canvas.width / 2, canvas.height / 2 + 80);
}

function gameLoop(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if(winScreenDisplayed){
    drawSpectateScreen();
  }else{
    drawBoard()
  }
  window.requestAnimationFrame(gameLoop)
}

// CONTROL AND MOVEMNT //
function checkDirQueue(){
  if(directionalQueue.length >= 1){
    var changeTo = directionalQueue.shift();
    if(!playerSnakeRef){
      setTimeout(checkDirQueue,10);
      return;
    }
    if(playerSnakeRef.body.length == 1){
      socket.emit("change_direction",{
        uid: player,
        direction: changeTo,
        api_key
      });
      currDirection = changeTo
    }else{
      if(changeTo != inverseMap[currDirection]){
        socket.emit("change_direction",{
          uid: player,
          direction: changeTo,
          api_key
        });
        currDirection = changeTo
      }
    }
  }
  if(directionalQueue.length <= 1){
    setTimeout(checkDirQueue,10);
  }else{
    setTimeout(checkDirQueue,10)
  }
}
canvas.addEventListener('click', function() {
  if(winScreenDisplayed){
    location.reload();
  }
});
document.addEventListener("keydown",(e)=>{
  var direction = keyMap[e.which];
  var chatInput = document.getElementById("chatinput")
  var isFocused = (document.activeElement === chatInput);
  if(!isFocused){
    if(direction){
      directionalQueue.push(direction);
      directionChanging = true;
    }
  }
  if(e.which == 13){
    if(chatInput.value.length > 0){
      sendChat();
    }
    if(isFocused){
      chatInput.blur();
    }else{
      chatInput.focus()
    }
  }
});

// PING & FPS //
function _ping(){
  socket.emit("ping",{uid:player});
}
function calculateFPS() {
  var now = performance.now();
  var elapsed = now - lastDrawTime;
  lastDrawTime = now;
  var fps = 1 / (elapsed / 1000);
  fpsBuffer.push(fps);
  if (fpsBuffer.length > 60) {
    fpsBuffer.shift();
  }
  var totalFPS = fpsBuffer.reduce((acc, val) => acc + val, 0);
  var averageFPS = totalFPS / fpsBuffer.length;
  return averageFPS;
}
socket.on("pong",(data)=>{
  var pong = performance.now()
  if(data.uid == player){
    pDiff = pong-ping; 
  }
});

// GAME CRITICAL
socket.on("board_request_respond",(data)=>{
  board = data;
  updateInterval = data.tick;
  updateLeaders(data.snakes);
});

// WIN, LOSS, DEATH //
function die(){
  player = null;
  playerSnakeRef = null;
  setTimeout(join,1000);
}
function getWinPhrase(won) {
  const phrases = [
    "Winner winner, chicken dinner!",
    "You're on fire!",
    "Can't stop, won't stop!",
    "You're killing it!",
    "You're unstoppable!",
    "Amazing!",
    "Incredible!",
    "You're a machine!",
    "Impressive!",
    "Awesome!",
    "You're a legend!",
    "Unbelievable!",
    "You're a rockstar!",
    "Bravo!",
    "Outstanding!",
    "You're the best!",
    "Spectacular!",
    "Genius!",
    "Superb!",
    "You're a boss!",
    "Fantastic!",
    "Magnificent!",
    "You're a pro!",
    "Perfection!",
    "Stunning!"
  ];

  const lostPhrases = [
    "Better luck next time!",
    "You'll get it next time!",
    "Don't give up!",
    "It's okay, keep trying!",
    "You can do it!",
    "Just a small setback!",
    "Stay positive!",
    "You're improving!",
    "Don't stop believing!",
    "Keep pushing!",
    "You're learning!",
    "Mistakes happen!",
    "Rome wasn't built in a day!",
    "Every failure is a stepping stone!",
    "Never give up!",
    "The journey is more important than the destination!",
    "You're getting closer!",
    "Take a deep breath and try again!",
    "Don't be discouraged!",
    "You're making progress!",
    "Practice makes perfect!",
    "It's not over until it's over!",
    "You'll get there!",
    "Believe in yourself!",
    "Keep moving forward!"
  ];

  const selectedPhrase = won ?
    phrases[Math.floor(Math.random() * phrases.length)] :
    lostPhrases[Math.floor(Math.random() * lostPhrases.length)];

  // Truncate selected phrase to 60 characters or less
  const truncatedPhrase = selectedPhrase.length > 60 ?
    selectedPhrase.slice(0, 57) + "..." :
    selectedPhrase;

  return truncatedPhrase;
}
socket.on("snake_death",(data)=>{
  if(player == data.uid){
    die();
  }
});
socket.on("win",(data)=>{
  if(data.uid == player){
    displaySpectateScreen("You Win!",getWinPhrase(true));
  }else{
    displaySpectateScreen("You Lose!",getWinPhrase(false));
  }
});


// CHAT //
document.getElementById("sendchat").onclick = sendChat;
function sendChat(){
  if(user && user.verified && ((new Date().getFullYear() - user.yearBorn) >= 13)){
    var chat = document.getElementById("chatinput").value;
    document.getElementById("chatinput").value = "";
    socket.emit("chat",{
      from: username,
      message: chat,
      room,
    });
  }else{
    if(user && (new Date().getFullYear() - user.yearBorn) < 13){
      document.getElementById("chatinput").value = "";
      displayNotif("You must be over 13 to chat")
    }else{
      displayNotif("<a href = '/login'>Login</a> to chat")
    }
  }
}
socket.on("chat",(data)=>{
  var string = "";
  if(user && user.verified && ((new Date().getFullYear() - user.yearBorn) >= 13)){
    string = `<p class="message"><span class = "msender">${data.from}:</span> ${data.message}</p>`;
  }else{
    if(user){
      string = `<p class="message"><span class = "msender">System:</span> You must be over 13 to chat</p>`;
    }else{
      string = `<p class="message"><span class = "msender">System:</span> <a href = "/login">Login</a> to chat</p>`;
    }
  }
  document.querySelectorAll(".message_list")[0].innerHTML += string;
  scrollToBottom(document.querySelectorAll(".message_list")[0]);
})

// INITIALIZERS //

// Generate reCAPTCHA token and send it to the server
grecaptcha.ready(function () {
  grecaptcha.execute('6LcMwRomAAAAAHP9L7Ou4_54whFRZF5hdy5gItM9', { action: 'play_game' }).then(function (token) {
    // Make an HTTP POST request to the server
    fetch('/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const { key } = data;
          // Handle the received key, for example:
          api_key = key;
          join();
        } else {
          const { error } = data;
          // Handle the error, for example:
          displayNotif("The server has judged that you are botting. View the console for more details","red");
          console.log(error);
        }
      })
      .catch(error => {
        // Handle any network or server error, for example:
        console.error(error)
        displayNotif(error.message,"red");
      });
  });
});

checkDirQueue();
gameLoop();
setInterval(()=>{
  ping = performance.now();
  _ping();
},500);