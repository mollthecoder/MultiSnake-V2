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
    function uid() {
        var d = new Date().getTime();
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;
            if(d > 0){
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
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
  function displayNotif(notifText, color) {
    const notification = document.createElement("div");
    notification.innerHTML = notifText || "Something happened...";
    notification.classList.add("notification");
    notification.style.backgroundColor = color || "white";
    notification.style.color = (color) ? "#fff" : "#000";
    if(!color){
      notification.style.border = "1px solid white; "
    }
    document.getElementById("notif-box").appendChild(notification);
  
    // Automatically remove the notification after 3 seconds
    setTimeout(function() {
      document.getElementById("notif-box").removeChild(notification);
    }, 3000);
  }
function highlightNav(){
  var curr = window.location.href;
  document.querySelectorAll("nav div a").forEach((a)=>{

    if(a.href.toLowerCase() == curr.toLowerCase()){
      a.classList.add("active")
    }
  });
}
highlightNav()
function redirect(to){
    setTimeout(()=>{
        window.location.replace(to)
    },1500);
}
function handleRes(response){
  if(response.redirect){
    redirect(response.redirect);
  }
  displayNotif(response.message,response.color);
}