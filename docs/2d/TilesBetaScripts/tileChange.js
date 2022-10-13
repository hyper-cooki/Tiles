window.addEventListener("beforeunload", (event) => {
  // set a truthy value to property returnValue
  event.returnValue = true;
});

function hexToRgb(hex){
  var c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
          c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return [(c>>16)&255, (c>>8)&255, c&255].join(',');
  }
  throw new Error('Bad Hex');
}

function resetTiles(tileTypeNumber) {
  for (let i = 0; i < mapData.length; i++) {
    for (let i2 = 0; i2 < mapData[i].length; i2++) {
      mapData[i][i2] = tileTypeNumber;
    }
  }
}

function clickCounter() {
  if (typeof(Storage) !== "undefined") {
    if (sessionStorage.clickcount) {
      sessionStorage.clickcount = Number(sessionStorage.clickcount)+1;
    } else {
      sessionStorage.clickcount = 1;
    }
    document.getElementById("result").innerHTML = "Saved! " + "(" + sessionStorage.clickcount + ")";
  } else {
    document.getElementById("result").innerHTML = "Sorry, your browser does not support web storage...";
  }
}

const color = document.getElementById("tileColour");
const transparency = document.getElementById("tileOpacity");

color.addEventListener("input",(event)=>{
  var tileTypeID = Object.keys(TILE_TYPES).length
  rgb = hexToRgb(document.getElementById("tileColour").value);
  rgba = "rgba("+rgb+","+document.getElementById("tileOpacity").value+")";
  TILE_TYPES[tileTypeID] = { id: TILE_TYPES.length, color: rgba };
});

transparency.addEventListener("input",(event)=>{
  var tileTypeID = Object.keys(TILE_TYPES).length
  rgb = hexToRgb(document.getElementById("tileColour").value);
  rgba = "rgba("+rgb+","+document.getElementById("tileOpacity").value+")";
  TILE_TYPES[tileTypeID] = { name: 'Custom', color: rgba };
});

function findObjectCoords(mouseEvent)
{
  var obj = document.getElementById("orthogonal-map");
  var obj_left = 0;
  var obj_top = 0;
  var xpos;
  var ypos;
  while (obj.offsetParent)
  {
    obj_left += obj.offsetLeft;
    obj_top += obj.offsetTop;
    obj = obj.offsetParent;
  }
  if (mouseEvent)
  {
    //FireFox
    xpos = mouseEvent.pageX;
    ypos = mouseEvent.pageY;
  }
  else
  {
    //IE (I should remove this because it's no like anyone uses Internet Explorer anymore, RIGHT?)
    xpos = window.event.x + document.body.scrollLeft - 2;
    ypos = window.event.y + document.body.scrollTop - 2;
  }
  xpos -= obj_left;
  ypos -= obj_top;

  newXpos = xpos;
  newYpos = ypos;
}
document.getElementById("orthogonal-map").onmousemove = findObjectCoords;

function clickTile() {
  var x = newXpos;
  var y = newYpos;

  x = Math.trunc(x / document.getElementById("tileSize").value);
  y = Math.trunc(y / document.getElementById("tileSize").value);

  mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;

  document.getElementById("orthogonal-map").height = document.getElementById("tileSize").value * mapData.length;
  document.getElementById("orthogonal-map").width = document.getElementById("tileSize").value * mapData[0].length;
}

var indexOfObject;

function deleteTileTypes() {
  for (let i = 1; i < TILE_TYPES.length-1;) {
    if (!(mapData.toString().includes(i))) {      
      TILE_TYPES.splice(i, 1);
    } else {
      i++;
    }
  }
  console.log(TILE_TYPES);
}

function download(dataurl, filename) {
  const link = document.createElement("a");
  link.href = dataurl;
  link.download = filename;
  link.click();
}

var uihidden = false;

function toggleUI() {
  uihidden = !uihidden;
  if (uihidden) {
    document.getElementById('ui-stuff').style.display = "none";
    document.getElementById('minimise-bar').style.cursor = "s-resize";
  } else {
    document.getElementById('ui-stuff').style.display = "block";
    document.getElementById('minimise-bar').style.cursor = "n-resize";
  }
}