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

function resetTiles() {
  for (let i = 0; i < mapData.length; i++) {
    for (let i2 = 0; i2 < mapData[i].length; i2++) {
      mapData[i][i2] = 0;
      sessionStorage.tiles = mapData;
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
    document.getElementById("result").innerHTML = "You have clicked the button " + sessionStorage.clickcount + " time(s) in this session.";
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
  TILE_TYPES[tileTypeID] = { name: 'Custom'+tileTypeID, color: rgba };
});

transparency.addEventListener("input",(event)=>{
  var tileTypeID = Object.keys(TILE_TYPES).length
  rgb = hexToRgb(document.getElementById("tileColour").value);
  rgba = "rgba("+rgb+","+document.getElementById("tileOpacity").value+")";
  TILE_TYPES[tileTypeID] = { name: 'Custom', color: rgba };
});

function clickTile() {
  var x = event.clientX - 9;
  var y = event.clientY - 40;

  x = Math.trunc(x / 64);
  y = Math.trunc(y / 64);

  mapData[y][x] = Object.keys(TILE_TYPES).length-1;
}

function deleteTileTypes() {
  for (let i = 0; i < Object.keys(TILE_TYPES).length-2; i++) {
    if (!(mapData.includes(i))) {
      delete TILE_TYPES[i];
    }
  }
}

function download(dataurl, filename) {
  const link = document.createElement("a");
  link.href = dataurl;
  link.download = filename;
  link.click();
}