// Possible tile types
const TILE_TYPES = {
  0: { name: 'Transparent', color: 'rgba(0,0,0,0)' },
  1: { name: 'Custom', color: 'rgba(0,0,0,1)' },
}
    
    // Map tile data
const mapData = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

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
    this.ctx.fillStyle = this.type.color
    this.ctx.fillRect(xPos, yPos, this.size, this.size)
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

    const numCols = this.data[0].length
    const numRows = this.data.length
    
    // Iterate through map data and draw each tile
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {

        // Get tile ID from map data
        const tileId = this.data[y][x]
        
        // Use tile ID to determine tile type from TILE_TYPES (i.e. Sea or Land)
        const tileType = TILE_TYPES[tileId]

        // Create tile instance and draw to our canvas
        new Tile(this.tileSize, tileType, this.ctx).draw(x, y)

        // Draw an outline with coordinates on top of tile if show grid is enabled
        if (this.showGrid) {
          this.drawGridTile(x, y)
        }
      }
    }
  }
  
  drawGridTile (x, y) {
    // Store positions
    const xPos = x * this.tileSize
    const yPos = y * this.tileSize

    // Draw grid
    this.ctx.strokeStyle = '#999'
    this.ctx.lineWidth = 0.5
    this.ctx.strokeRect(xPos, yPos, this.tileSize, this.tileSize)
  }
}

function mouseMoveWhilstDown(target, whileMove) {
  
}

// Init canvas tile map on document ready
document.addEventListener('DOMContentLoaded', function () {

  // Init orthogonal map
  const map = new OrthogonalMap('orthogonal-map', mapData, { tileSize: document.getElementById("tileSize").value })

  function sussyfunc() {
    clickTile();
    map.draw();
  }

  const loader = document.getElementById('orthogonal-map')
  loader.addEventListener('mousedown', function () {
    inter=setInterval(sussyfunc, 0);
  })

  loader.addEventListener('mouseup', function () {
    clearInterval(inter);
  })

  const resetLoader = document.getElementById('resetButton')
  resetLoader.addEventListener('click', function () {
    map.draw()
  })

  const exportButton = document.getElementById('exportButton')
  exportButton.addEventListener('click', function () {
    map.toggleGrid();
    var canvas = document.getElementById('orthogonal-map');
    var img = canvas.toDataURL('image/png');
    var fileName = document.getElementById('fileNameInput').value;
    download(img, fileName+".png");
    map.toggleGrid();
  })
})