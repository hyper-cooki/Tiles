if (sessionStorage.tiletypes) {
  TILE_TYPES = JSON.parse(sessionStorage.getItem("tiletypes"))
} else {
  // Possible tile types
  TILE_TYPES = [
    { id: 0, colour: 'rgba(0,0,0,0)' },
    { id: 1, colour: 'rgba(255,255,255,1)' },
  ]
}
    
if (sessionStorage.tilemap) {
  mapData = JSON.parse(sessionStorage.getItem("tilemap"))
} else {
  // Map tile data
  mapData = [[
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ], [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ], [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]]
}

/**
  Tile class
 */
class Tile {
  
  constructor (size, type, ctx) {
    this.size = size
    this.type = type
    this.ctx = ctx
  }
  
  draw (x, y) {
    // Store positions
    const xPos = x * this.size
    const yPos = y * this.size

    // Draw tile
    this.ctx.fillStyle = this.type.colour
    if (this.type.tileImage == 'tri') {
      this.ctx.moveTo(xPos, yPos);
      this.ctx.lineTo(xPos+this.size, yPos+this.size);
      this.ctx.lineTo(xPos,yPos+this.size);
      this.ctx.lineTo(xPos, yPos);
      this.ctx.fill();
    } else if (this.type.tileImage == 'thin-tri') {
      this.ctx.moveTo(xPos, yPos);
      this.ctx.lineTo(xPos+this.size/2, yPos+this.size);
      this.ctx.lineTo(xPos,yPos+this.size);
      this.ctx.lineTo(xPos, yPos);
      this.ctx.fill();
    }else if (this.type.tileImage == 'curve') {
      //CURVE
      this.ctx.beginPath();
      this.ctx.arc(xPos, yPos+this.size, this.size, 1.5*Math.PI, 0);
      this.ctx.lineTo(xPos,yPos+this.size);
      this.ctx.fill();
    } else if (this.type.tileImage == '-curve') {
      //NEGATIVE CURVE
      this.ctx.beginPath();
      this.ctx.arc(xPos+this.size, yPos, this.size, 2.5*Math.PI, 1*Math.PI);
      this.ctx.lineTo(xPos,yPos+this.size);
      this.ctx.fill();
    } else if (this.type.tileImage == 'square'){
      //SQUARE/PIXEL
      this.ctx.fillRect(xPos, yPos, this.size, this.size)
    }
  }
}

/**
  Map class
 */
class Map {

  constructor (selector, data, opts) {
    this.canvas = document.getElementById(selector)
    this.ctx = this.canvas.getContext('2d')
    this.data = data
    this.tileSize = opts.tileSize
    this.showGrid = true
  }
  
  draw () {
    // Clear canvas before redrawing
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  toggleGrid () {
    // Toggle show grid option
    this.showGrid = !this.showGrid
    
    // Redraw map
    this.draw()
  }
}

/**
  OrthogonalMap class
 */

class OrthogonalMap extends Map {

  constructor (selector, data, opts) {
    super(selector, data, opts)
    this.draw()
  }

  draw () {
    super.draw() // Call draw() method from Map class

    const numCols = this.data[0][0].length
    const numRows = this.data[0].length
    
    // Iterate through map data and draw each tile
    for (let z = 0; z < this.data.length; z++) {
      for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numCols; x++) {

          // Get tile ID from map data
          const tileId = this.data[z][y][x]

          for (let i = 0; i < TILE_TYPES[TILE_TYPES.length-1].id+1; i++) {
            if (i == tileId) {
              var tileType = TILE_TYPES[i];
            }
          }

          // Create tile instance and draw to our canvas
          new Tile(this.tileSize, tileType, this.ctx).draw(x, y);

          // Draw an outline with coordinates on top of tile if show grid is enabled
          if (this.showGrid) {
            this.drawGridTile(x, y)
          }
        }
      }
    }
  }
  
  drawGridTile (x, y) {
    // Store positions
    const xPos = x * this.tileSize
    const yPos = y * this.tileSize

    // Draw grid
    this.ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    this.ctx.lineWidth = document.getElementById('tileSize').value / 32
    this.ctx.strokeRect(xPos, yPos, this.tileSize, this.tileSize)
  }
}

// Init canvas tile map on document ready
document.addEventListener('DOMContentLoaded', function () {

  document.getElementById("tileColour").style.backgroundColour = document.getElementById("tileColour").value;
  document.getElementById("tileImageSelect").value = TILE_TYPES[TILE_TYPES.length-1].tileImage;

  // Init orthogonal map
  const map = new OrthogonalMap('orthogonal-map', mapData, { tileSize: parseInt(document.getElementById("tileSize").value) })

  document.getElementById("orthogonal-map").height = document.getElementById("tileSize").value * mapData[0].length;
  document.getElementById("orthogonal-map").width = document.getElementById("tileSize").value * mapData[0][0].length;
  map.draw();

  var inter = null;
  var penDown = false;

  const ui = document.getElementById('draggable');
  function downfunc() {
    clickTile();
    map.draw();
    penDown = true;
    sessionStorage.setItem("tilemap", JSON.stringify(mapData));
    sessionStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));
  }

  function downCheck() {
    if (penDown) {
      document.getElementById('draggable').style.pointerEvents = "none";
    }
    else {
      document.getElementById('draggable').style.pointerEvents = "all";
    }
  }

  downCheckInter = setInterval(downCheck);

  const loader = document.getElementById('orthogonal-map')
  loader.addEventListener('mousedown', function () {
    inter = setInterval(downfunc);
  })
  
  loader.addEventListener('mouseup', function () {
    clearInterval(inter);
    penDown = false;
  })

  loader.addEventListener('mouseleave', function () {
    clearInterval(inter);
    penDown = false;
  })

  const html = document.getElementById('windowHTML')
  html.addEventListener('mouseleave', function () {
    clearInterval(inter);
    penDown = false;
  })

  html.addEventListener('resize', function () {
    console.log(html.scrollTop);
    console.log(html.scrollLeft);
  })

  const resetLoader = document.getElementById('resetButton')
  resetLoader.addEventListener('click', function () {
    map.draw();
    sessionStorage.setItem("tilemap", JSON.stringify(mapData));
    sessionStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));
  })

  const drawButton = document.getElementById('draw')
  drawButton.addEventListener('click', function () {
    map.draw();
    console.log(mapData);
  })

  const exportButton = document.getElementById('exportButton')
  exportButton.addEventListener('click', function () {
    map.toggleGrid();
    map.tileSize = 64;
    map.draw();
    var canvas = document.getElementById('orthogonal-map');
    var img = canvas.toDataURL('image/png');
    var fileName = document.getElementById('fileNameInput').value;
    download(img, fileName+".png");
    map.toggleGrid();
    setTimeout(function(){
      map.tileSize = document.getElementById("tileSize").value;
      map.draw();
    }, 1);
  })

  var mousedown = false;
  var uix = 0;
  var uiy = 0;
  var uioffsetx = 0;
  var uioffsety = 0;
  var newuix = 0;
  var newuiy = 0;
  var marginTop = 0;
  var marginLeft = 0;

  ui.addEventListener('mousedown', function () {
    document.getElementById('draggable').style.cursor = "grabbing";
    mousedown = true;

    marginTop = parseInt(window.getComputedStyle(current, null).getPropertyValue('margin-top'));
    marginLeft = parseInt(window.getComputedStyle(current, null).getPropertyValue('margin-left'));

    let rect = ui.getBoundingClientRect();
    ui.style.position = "fixed";
    ui.style.cursor = "pointer";
    ui.style.zIndex = "1000";

    uix = rect.left - marginLeft;
    uiy = rect.top - marginTop;
  });

  ui.addEventListener('mousemove', function (e) {
    if (mousedown) {
        if (uioffsetx == 0 && uioffsety == 0) {
            uioffsetx = (e.clientX - uix);
            uioffsety = (e.clientY - uiy);
        }

        newuix = (e.clientX - uioffsetx);
        newuiy = (e.clientY - uioffsety);

        ui.style.left = newuix + "px";
        ui.style.top = newuiy + "px";
        ui.style.bottom = 'auto';
        ui.style.right = 'auto';
    }
  });

  ui.addEventListener('mouseup', function () {
    document.getElementById('draggable').style.cursor = "grab";
    mousedown = false;
    currentx = 0;
    currenty = 0;
    offsetx = 0;
    offsety = 0;
    marginTop = 0;
    marginLeft = 0;
  })

  const size = document.getElementById("tileSize");
  size.oninput = function(){
    map.tileSize = document.getElementById("tileSize").value;
    document.getElementById("orthogonal-map").height = document.getElementById("tileSize").value * mapData[0].length;
    document.getElementById("orthogonal-map").width = document.getElementById("tileSize").value * mapData[0][0].length;
    document.getElementById("orthogonal-map").border = document.getElementById('tileSize').value / 32 + "px";
    map.draw();
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      for (let i = 0; i < mapData[0].length; i++) {
        mapData[0][i][mapData[0][i].length] = 0;
      }
      document.getElementById("orthogonal-map").width = document.getElementById("tileSize").value * mapData[0][0].length;
      map.draw();
    }
  }, false);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      for (let i = 0; i < mapData[0].length; i++) {
        mapData[0][i].length -= 1;
      }
      document.getElementById("orthogonal-map").width = document.getElementById("tileSize").value * mapData[0][0].length;
      map.draw();
    }
  }, false);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      mapData[0][mapData.length] = [];
      for (let i = 0; i < mapData[0].length; i++) {
        mapData[0][mapData.length-1][i] = 0;
      }
      document.getElementById("orthogonal-map").height = document.getElementById("tileSize").value * mapData[0].length;
      map.draw();
    }
  }, false);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      mapData[0].length -= 1;
      document.getElementById("orthogonal-map").height = document.getElementById("tileSize").value * mapData[0].length;
      map.draw();
    }
  }, false);

  document.addEventListener('keydown', (event) => {
    if ((event.key === 'r') && (!(event.metaKey))) {
      resetTiles(0);
      map.draw();
    }
  }, false);

  document.addEventListener('keydown', (event) => {    
    if ((event.metaKey) && (event.key == 's')){
      console.log("Saving...");
    }
  }, false);
})
