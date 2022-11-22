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
  for (let i = 0; i < Math.ceil(window.innerWidth/64); i++) {
    for (let i2 = 0; i2 < Math.ceil(window.innerHeight/64); i2++) {
      mapData[0][i][i2] = tileTypeNumber;
      document.getElementById("orthogonal-map").height = document.getElementById("tileSize").value * mapData[0].length;
      document.getElementById("orthogonal-map").width = document.getElementById("tileSize").value * mapData[0][0].length;
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

const colour = document.getElementById("tileColour");
const transparency = document.getElementById("tileOpacity");
const image = document.getElementById("tileImageSelect");

colour.addEventListener("input",(event)=>{
  var tileTypeID = Object.keys(TILE_TYPES).length
  rgb = hexToRgb(document.getElementById("tileColour").value);
  rgba = "rgba("+rgb+","+document.getElementById("tileOpacity").value+")";
  TILE_TYPES[tileTypeID] = { id: TILE_TYPES.length, colour: rgba };
  document.getElementById("tileColour").style.backgroundcolour = document.getElementById("tileColour").value;
});

transparency.addEventListener("input",(event)=>{
  var tileTypeID = Object.keys(TILE_TYPES).length
  rgb = hexToRgb(document.getElementById("tileColour").value);
  rgba = "rgba("+rgb+","+document.getElementById("tileOpacity").value+")";
  TILE_TYPES[tileTypeID] = { id: TILE_TYPES.length, colour: rgba };
});

image.addEventListener("input",(event)=>{
  var tileTypeID = Object.keys(TILE_TYPES).length
  rgb = hexToRgb(document.getElementById("tileColour").value);
  rgba = "rgba("+rgb+","+document.getElementById("tileOpacity").value+")";
  TILE_TYPES[tileTypeID] = { id: TILE_TYPES.length, colour: rgba, tileImage: image.value };
});

function mousePos(e) {
  xPosMap = e.clientX;
  yPosMap = e.clientY;
}

modeSwitch = 0;
modes = ['PEN', 'ERASER', 'FILL', 'DROPPER'];

function toggleMode() {
  modeSwitch += 1;
  if (modeSwitch > modes.length-1) {
    modeSwitch = 0;
  }
  document.getElementById("mode").innerHTML = "MODE: "+modes[modeSwitch];
}

function clickTile() {
  var x2 = xPosMap;
  var y2 = yPosMap;

  x = Math.trunc(x2 / document.getElementById("tileSize").value);
  y = Math.trunc(y2 / document.getElementById("tileSize").value);

  if (modeSwitch == 0) {
    mapData[0][y][x] = TILE_TYPES[TILE_TYPES.length-1].id;
  } else if (modeSwitch == 1) {
    mapData[0][y][x] = 0;
  } else if (modeSwitch == 2) {
    for (let i = 0; i < mapData[0].length; i++) {
      for (let i2 = 0; i2 < mapData[0][0].length; i2++) {
        mapData[0][i][i2] = TILE_TYPES[TILE_TYPES.length-1].id;
      }
    }
  } else if (modeSwitch == 3) {
    document.getElementById("tileColour").value = TILE_TYPES[mapData[0][y][x]].colour;
  }

  document.getElementById("orthogonal-map").height = document.getElementById("tileSize").value * mapData[0].length;
  document.getElementById("orthogonal-map").width = document.getElementById("tileSize").value * mapData[0][0].length;
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