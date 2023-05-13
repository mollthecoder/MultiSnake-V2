window.largeAlert = (html)=>{
  document.getElementById('alert-box').innerHTML = html;
  document.getElementById('alert-box').style.display = "inline";
}
if(window.self !== window.top){
  largeAlert('<h1>This site will preform a lot better <a href = "https://multisnake.sojs.dev/" target = "_blank">when opened in a new window</a>.</h1>')
}
$('#room-box').hide();
window.roomopen = false;
document.getElementById('join').addEventListener('click',(e)=>{
  openRoom();
});
document.getElementById("username").oninput = (e)=>{
  localStorage.setItem("username",e.target.value);
}
document.addEventListener('keypress',(e)=>{
  if(e.which == 13){
    if(!window.roomopen){
      openRoom();
    }
  }
});
if(localStorage.getItem("username")){
  document.getElementById("username").value = localStorage.getItem("username");
}
function openRoom(){
  var username = document.getElementById('username').value;
  localStorage.setItem("username",username);
  document.getElementById('username').remove();
  document.getElementById('join').remove();
  document.getElementById('big').remove();
  document.getElementById('room-box').style.display = "block";
  $('#room-box').fadeIn();
  window.roomopen = true;
  fetch("/api/v1/rooms").then(response => response.json())
  .then(json => {

    // use api to see who is online and in what rooms
    var roomsJSON = {};

    // convert to json
    json.forEach(item => roomsJSON[item.room_key] = item); 

    // create UI container
    var classicContainer = document.createElement('fieldset');
    classicContainer.classList.add('mod-container');
    var classiclegend = document.createElement('legend');
    classiclegend.appendChild(document.createTextNode('classic'));
    classicContainer.id = "classic-container"
    classicContainer.appendChild(classiclegend);

    // loop through room creation code and create 3 rooms
    for(var i = 0; i < 5; i++){
      // create a link to the room, use API to see how many people are on. Append to UI container
      var a = document.createElement('a');
      a.href = "/play/classic_"+i;
      var online = (roomsJSON["classic_"+i]) ? roomsJSON["classic_"+i].snake_quantity || 0 : 0;
      linkText = document.createTextNode('Classic-'+i+' | Online: '+ Math.max(online,3));
      a.appendChild(linkText);
      a.classList.add('room');
      classicContainer.appendChild(a);
    }

    // append container to DOm
    document.getElementById('rooms-plain').appendChild(classicContainer);
    
  });
}

/*
Art by Max Strandberg
      _______
     / _   _ \
    / (.) (.) \
   ( _________ )
    \`-V-|-V-'/
     \   |   /
      \  ^  /
       \    \
        \    `-_
         `-_    -_
            -_    -_
            _-    _-
          _-    _-
        _-    _-
      _-    _-
      -_    -_
        -_    -_
          -_    -_
            -_    -_
            _-    _-
  ,-=:_-_-_-_ _ _-_-_-_:=-.
 /=I=I=I=I=I=I=I=I=I=I=I=I=\
|=I=I=I=I=I=I=I=I=I=I=I=I=I=|
|I=I=I=I=I=I=I=I=I=I=I=I=I=I|
\=I=I=I=I=I=I=I=I=I=I=I=I=I=/
 \=I=I=I=I=I=I=I=I=I=I=I=I=/
  \=I=I=I=I=I=I=I=I=I=I=I=/
   \=I=I=I=I=I=I=I=I=I=I=/
    \=I=I=I=I=I=I=I=I=I=/
     `================='
 */