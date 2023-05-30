window.largeAlert = (html)=>{
  document.getElementById('alert-box').innerHTML = html;
  document.getElementById('alert-box').style.display = "inline";
}
if(window.self !== window.top){
  largeAlert('<h1>This site will preform a lot better <a href = "https://multisnake.45.33.54.245:3000/" target = "_blank">when opened in a new window</a>.</h1>')
}
document.getElementById("room-box").style.display = "none";
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
  window.roomopen = true;
  fetch("/api/v1/rooms").then(response => response.json())
  .then(json => {

    // use api to see who is online and in what rooms
    var roomsJSON = {};

    // convert to json
    json.forEach(item => roomsJSON[item.room_key] = item); 

    [
      {
        'name':'Classic',
        'type':'classic'
      },
      {
        'name':'Standard',
        'type':'standard'
      },
      {
        'name':'Small',
        'type':'small'
      },
      // {
      //   'name':'Fog',
      //   'type':'fog'
      // },
      // {
      //   'name':'Tag',
      //   'type':'tag'
      // },
      // {
      //   'name':'Redlight',
      //   'type':'redgreen'
      // }
    ].forEach((d)=>{
      // create UI container for mod
      var modContainer = document.createElement('fieldset');
      modContainer.classList.add('mod-container');
      var legend = document.createElement('legend');
      legend.appendChild(document.createTextNode(d.name));
      modContainer.id = "mod-container-"+d.type;
      modContainer.appendChild(legend);
      // create 3 rooms per mod
        for(var i = 0; i < 3; i++){
          // create link to room and append to container
          var a = document.createElement('a');
          a.href = "/play?username="+username+"&room="+d.type+i+"&type="+d.type;
          a.href = `/play/${d.type}_${i}?type=${d.type}`
          var online = (roomsJSON[d+i]) ? roomsJSON[d+i].snake_quantity || 0 : 0;
          linkText = document.createTextNode(d.name+'-'+i+' | Online: '+ Math.max(online,Math.floor(Math.random()*3)));
          a.appendChild(linkText);
          a.classList.add('room');
          modContainer.appendChild(a);
        }
      // append container to DOm
      document.getElementById('rooms-plain').appendChild(modContainer)
    })
    
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