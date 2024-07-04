// Prevent pinch to zoom on window
window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
    }
}, {
    "passive": false
});

// Initialise canvas and 2d context
const c = document.createElement("canvas");
var ctx = c.getContext("2d");

// Set size of canvas
c.height = window.innerHeight;
c.width = window.innerWidth;
c.style.opacity = "1";

// Give canvas "canvas" id
c.setAttribute("id", "canvas");

// Add canvas to layout body
document.getElementsByClassName("body")[0].appendChild(c);

// Get stored TILE_TYPES or create new TILE_TYPES variable
if (sessionStorage.tiletypes) {
    TILE_TYPES = JSON.parse(sessionStorage.getItem("tiletypes"));
} else {
    if (localStorage.tiletypes) {
        TILE_TYPES = JSON.parse(localStorage.getItem("tiletypes"));
    } else {
        TILE_TYPES = [
            { id: 1, colour: '#ffffff' },
        ];
    }
}

// Get stored mapData or create new mapData variable
if (sessionStorage.tilemap) {
    mapData = JSON.parse(sessionStorage.getItem("tilemap"));
} else {
    if (localStorage.tilemap) {
        mapData = JSON.parse(localStorage.getItem("tilemap"));
    } else {
        // Create tilemap with max width and height possible in window size
        mapData = [];
        for (let i = 0; i < Math.ceil(c.height/document.getElementById('tileScale').value); i++) {
            mapData[i] = [];
            for (let i2 = 0; i2 < Math.ceil(c.width/document.getElementById('tileScale').value); i2++) {
                mapData[i][i2] = 0;
            }
        }
    }
}

// Function for writing mapData and TILE_TYPES into storage
function saveTilemap() {
    localStorage.setItem("tilemap", JSON.stringify(mapData));
    localStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));
    sessionStorage.setItem("tilemap", JSON.stringify(mapData));
    sessionStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));
}

// Get and set tile options
const tileColour = document.getElementById("tileColour");
tileColour.value = TILE_TYPES[TILE_TYPES.length-1].colour;

const tileOutline = document.getElementById("tileOutline");
if(TILE_TYPES[TILE_TYPES.length-1].outline){
    tileOutline.value = TILE_TYPES[TILE_TYPES.length-1].outline;
    tileOutline.classList.add('disabled'); tileOutline.setAttribute('disabled', '');
    document.getElementById("outlineCheck").checked=true
}

const tileOpacity = document.getElementById("tileOpacity");
if(TILE_TYPES[TILE_TYPES.length-1].opacity){
    tileOpacity.value = TILE_TYPES[TILE_TYPES.length-1].opacity
}

const tileShape = document.getElementById("tileShape");
if(TILE_TYPES[TILE_TYPES.length-1].shape){
    tileOpacity.value = TILE_TYPES[TILE_TYPES.length-1].shape
}

// Initialise Coloris colour picker
Coloris({
    theme: 'large',
    defaultColor: '#ffffff',
    themeMode: 'dark',
    alpha: false,
    swatches: ['#fff','#000','#ffa500'],
    a11y: {
        open: 'Open color picker',
        clear: 'Clear the selected color',
        marker: 'Saturation: {s}. Brightness: {v}.',
        hueSlider: 'Hue slider',
        input: 'Color value field',
        format: 'Color format',
        swatch: 'Color swatch',
        instruction: 'Saturation and brightness selector. Use up, down, left and right arrow keys to select.'
    }
});

// Get tile transform option elements
const tileX = document.getElementById("tileX");
const tileY = document.getElementById("tileY");
const tileDeg = document.getElementById("tileDeg");

// Get export option elements
const filext = document.getElementById('filext');
const filex = document.getElementById('filex');
const filey = document.getElementById('filey');
const filew = document.getElementById('filew');
const fileh = document.getElementById('fileh');
const downloadButton = document.getElementById("downloadButton");

const tileScale = document.getElementById("tileScale");
const gridToggle = document.getElementById("gridToggle");

// Dialog box for pop-up info
const dialogBox = document.getElementById("dialog");

// Use the same dialog box but change the content inside
function showDialogBox(content) {
    if (content == "about") {
        dialogBox.innerHTML='<form><h2>Tiles 2D</h2><br><h1>By <a href="https://cookistudios.com" style="font-weight: bold;">Cooki Studios</a></h1><br><button autofocus formmethod="dialog" onkeypress="if(event.key=\""Enter\""){this.click()}>Close</button></form>'
        dialogBox.showModal();
    } else if (content == "reset") {
        dialogBox.innerHTML='<form><h2>Hold up!<br>Are you sure you want to reset?</h2><br><h1>All progress will be lost unless saved as a .cstiles file.</h1><br><button style="background-color: #ffa500; border-color: whitesmoke;" autofocus formmethod="dialog" value="cancel" onkeypress="if(event.key=\'Enter\'){this.click()}">Cancel</button><button style="margin-left: 2rem;" formmethod="dialog" value="confirm" onkeypress="if(event.key=\'Enter\'){this.click()}">Yes</button></form>'
        dialogBox.showModal();
    }

    dialogBox.addEventListener("close", () => {
        // If user confirms to everything being reset
        if (dialogBox.returnValue == "confirm") {
            // Reset TILE_TYPES to just id:1 tile
            TILE_TYPES = [
                { id: 1, colour: '#ffffff' },
            ]

            // Set mapData to empty array
            mapData = [];

            // Create tilemap for the size of the canvas
            for (let i = 0; i < Math.ceil(c.height/tileScale.value); i++) {
                mapData[i] = [];
                for (let i2 = 0; i2 < Math.ceil(c.width/tileScale.value); i2++) {
                    mapData[i][i2] = 0;
                }
            }

            // Save tilemap to storage
            saveTilemap();

            // Reset tile options
            tileColour.value = TILE_TYPES[TILE_TYPES.length-1].colour;
            document.getElementById('outlineCheck').checked = false;
            tileOutline.classList.add('disabled');
            tileOutline.setAttribute('disabled', '');
            tileOpacity.value = 100;
            tileShape.value = "square";

            // Update canvas
            drawLayer(
                Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
            );

            document.getElementById("reset").style.backgroundColor = "";
            document.getElementById("reset").style.fontWeight = "";
        }
    });
}

// Initialise variable for storing selected x and y
const selectRange = [];

// Function for setting the tool from the left menu
function setTool(tool) {
    // Set all buttons background colour to none
    document.querySelectorAll(".toolsLayout .button").forEach(button => {
        button.style.backgroundColor = "";
        button.style.fontWeight = "";
    });

    // Set tool input to tool element
    tool = document.getElementById(tool+" tool")

    // Set selected tool to have orange background
    if (tool.srcElement == undefined) {
        tool.style.backgroundColor = "#ffa500";
        tool.style.fontWeight = "bold";
    } else {
        tool.srcElement.style.backgroundColor = "#ffa500";
        tool.style.fontWeight = "bold";
    }
    
}

// If there is no set tool in storage then set to pen
if (!localStorage.tool) {
    setTool("pen");
} else {
    if (!sessionStorage.tool) {
        setTool("pen");
    }
}

// Function for creating a new tile type with currently set options
function createTileType() {
    // Add new tile types to the end of TILES_TYPES array with a new id and the set colour
    TILE_TYPES[TILE_TYPES.length] = { 
        id: TILE_TYPES[TILE_TYPES.length-1].id+1, colour: tileColour.value
    }

    // Set new tile's outline
    if (document.getElementById('outlineCheck').checked) {
        TILE_TYPES[TILE_TYPES.length-1].outline = tileOutline.value
    }

    // Set new tile's opacity
    if (tileOpacity.value) {
        TILE_TYPES[TILE_TYPES.length-1].opacity = tileOpacity.value
    }

    // Set new tile's shape
    if (tileShape.value != "square") {
        TILE_TYPES[TILE_TYPES.length-1].shape = tileShape.value
    }
}

// Function for drawing the layer with x and y pos, width, height whether to show grid and whether to show selection box
function drawLayer(lx,ly,lw,lh,scale,grid,showSelect) {
    // Wipe canvas clean
    ctx.clearRect(0,0,c.width,c.height);
    
    if (lw && lh) {
        // Draw tiles for the set size of the layer
        for (let y = 0; y < lh; y++) {
            for (let x = 0; x < lw; x++) {
                drawTile(x,y,lx,ly,scale,showSelect);
            }
        }

        // Draw grid tiles for the set size of the layer
        if (grid) {
            if (scale > 5) {
                for (let y = 0; y < lh; y++) {
                    for (let x = 0; x < lw; x++) {
                        drawGridTile(x+lx,y+ly,scale);
                    }
                }
            }
        }
    } else {
        // Draw tiles for the max size of mapData (oh no i gotta fix this one to not draw off-screen)
        for (let y = 0; y < mapData.length; y++) {
            for (let x = 0; x < mapData[0].length; x++) {
                drawTile(x,y,lx,ly,scale,showSelect);
            }
        }

        // Draw grid tiles for the max size of mapData (oh no i gotta fix this one to not draw off-screen)
        if (grid) {
            if (scale > 5) {
                for (let y = 0; y < mapData.length; y++) {
                    for (let x = 0; x < mapData[0].length; x++) {
                        drawGridTile(x+lx,y+ly,scale);
                    }
                }
            }
        }
    }
}

// Function for drawing a single tile at x and y, offset x and y and whether to show selection box
function drawTile(x,y,lx,ly,scale,showSelect) {
    // If tile is not blank tile (should change this later for opacity:0)
    if (mapData[y][x] != 0) {
        // Loop over all of TILE_TYPES
        for (let i = 0; i < TILE_TYPES.length; i++) {
            // If the id of the tile in TILE_TYPES matches with the number at x,y
            if (TILE_TYPES[i].id == mapData[y][x]) {
                // Add offset
                x += lx;
                y += ly;

                // Set drawing fill colour to the colour in TILE_TYPES
                ctx.fillStyle = TILE_TYPES[i].colour;

                // If there is a set opacity in TILE_TYPES then set the globalAlpha of the opacity divided by 100 to get a decimal (e.g. 24 = 0.24)
                if (TILE_TYPES[i].opacity) {
                    ctx.globalAlpha = TILE_TYPES[i].opacity/100;
                }

                // If there is no set shape then draw a square with fillRect
                if (!TILE_TYPES[i].shape) {
                    ctx.fillRect(Math.ceil(x*scale),Math.ceil(y*scale),scale,scale);
                } else if (TILE_TYPES[i].shape == "triangle") {
                    // Draw a custom shape starting at the top right, then bottom right, then bottom left, then join up with the start
                    ctx.beginPath();
                    ctx.moveTo((Math.ceil(x*scale))+scale,Math.ceil(y*scale));
                    ctx.lineTo((Math.ceil(x*scale))+scale,(Math.ceil(y*scale))+scale);
                    ctx.lineTo(Math.ceil(x*scale), (Math.ceil(y*scale))+scale);
                    ctx.closePath();
                    ctx.fill();
                } else if (TILE_TYPES[i].shape == "thin-triangle") {
                    // Draw a custom shape same as triangle but bottom left is only half way
                    ctx.beginPath();
                    ctx.moveTo((Math.ceil(x*scale))+scale, (Math.ceil(y*scale)));
                    ctx.lineTo((Math.ceil(x*scale))+scale, (Math.ceil(y*scale))+scale);
                    ctx.lineTo((Math.ceil(x*scale))+tileScale.value/2, (Math.ceil(y*scale))+scale);
                    ctx.closePath();
                    ctx.fill();
                } else if (TILE_TYPES[i].shape == "curve") {
                    // Draw a custom shape that is a quarter circle then add the two other sides
                    ctx.beginPath();
                    ctx.arc((Math.ceil(x*scale))+scale, (Math.ceil(y*scale))+scale, scale, 1 * Math.PI, 1.5 * Math.PI);
                    ctx.lineTo((Math.ceil(x*scale))+scale, (Math.ceil(y*scale))+scale);
                    ctx.lineTo((Math.ceil(x*scale)), (Math.ceil(y*scale))+scale);
                    ctx.closePath();
                    ctx.fill();
                } else if (TILE_TYPES[i].shape == "reverse-curve") {
                    // Draw a custom shape same as curve but the quarter circle is the other direction
                    ctx.beginPath();
                    ctx.arc((Math.ceil(x*scale)), (Math.ceil(y*scale)), scale, 0 * Math.PI, 0.5 * Math.PI);
                    ctx.lineTo((Math.ceil(x*scale))+scale, (Math.ceil(y*scale))+scale);
                    ctx.lineTo((Math.ceil(x*scale))+scale, (Math.ceil(y*scale))+scale);
                    ctx.closePath();
                    ctx.fill();
                }

                // Set opacity back to 1 for next step
                ctx.globalAlpha = 1;

                // If it is going to show selection box
                if (showSelect) {
                    // Get start x, start y, end x and end y from selectRange
                    if (selectRange[0]==x&&selectRange[1]==y||((x>=selectRange[0]&&x<=selectRange[2])||(x<=selectRange[0]&&x>=selectRange[2]))&&((y>=selectRange[1]&&y<=selectRange[3])||(y<=selectRange[1]&&y>=selectRange[3]))) {
                        // Set transparency to 0.25, set colour to light blue and draw a rectangle at the tile's position
                        ctx.globalAlpha = 0.25;
                        ctx.fillStyle = "#4287f5";
                        ctx.fillRect(Math.ceil(x*scale),Math.ceil(y*scale),scale,scale);
                
                        // Set opacity back to 1
                        ctx.globalAlpha = 1;
                    }
                }

                // If there is an outline then draw the outline with the colour from TILE_TYPES (currently only square)
                if (TILE_TYPES[i].outline) {
                    ctx.strokeStyle = TILE_TYPES[i].outline;
                    ctx.strokeRect(Math.ceil(x*scale),Math.ceil(y*scale),scale,scale);
                }
            }
        }
    }
}

// Same as drawTile function but for drawing a grid tile
function drawGridTile(x,y,scale) {
    // Multiply the x and y by tileScale because each tile is tileScale*tileScale
    x *= scale;
    y *= scale;

    // Draw white outline with 0.25 transparency and a width of 2 pixels
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = "2";
    ctx.strokeRect(x,y,scale,scale);
}

// Init variables for when the mouse is down
var mouseDown = false;

// Right click
var rightMouseDown = false;

// Variable for last point of contact
var lastPoint;

// If the tool in storage is undefined then set tool to pen
if (localStorage.getItem("tool") == undefined) {
    if (sessionStorage.getItem("tool") == undefined) {
        var tool = "pen";
    } else {
        // Otherwise, get the tool and set it's element to be orange
        var tool = sessionStorage.getItem("tool");
        document.getElementById(sessionStorage.getItem("tool")+" tool").style.backgroundColor = "#ffa500";
        document.getElementById(sessionStorage.getItem("tool")+" tool").style.borderRadius = "0.1rem";
    }
} else {
    // Otherwise, get the tool and set it's element to be orange
    var tool = localStorage.getItem("tool");
    document.getElementById(localStorage.getItem("tool")+" tool").style.backgroundColor = "#ffa500";
    document.getElementById(localStorage.getItem("tool")+" tool").style.borderRadius = "0.1rem";
}

// Function for gettng mouse position
function getMousePosition(event) {
    // Get position of canvas
    var bounds = c.getBoundingClientRect();

    var scaleX = c.width / bounds.width;
    var scaleY = c.height / bounds.height;

    // Get mouse position divided by tileScale for the tile size and use Math.floor to round the numbers
    var x = Math.floor((event.clientX - bounds.left) * scaleX / JSON.parse(tileScale.value));
    var y = Math.floor((event.clientY - bounds.top) * scaleY / JSON.parse(tileScale.value));

    // Fix for when x is read as -1 instaed of 0
    if (x < 0) {
        x = 0;
    }

    // Fix for when y is read as -1 instaed of 0
    if (y < 0) {
        y = 0;
    }

    // Output the resulting values to where the function was called
    return { x, y };
}

// Init variables for getting smooth drawing
var oldX;
var oldY;

const uiElements = [document.getElementsByClassName("header")[0],document.getElementsByClassName("left-side")[0],document.getElementsByClassName("right-side")[0],document.getElementById("scrollx-container"),document.getElementById("scrolly-container"),document.getElementsByClassName("footer")[0]];

// Function for drawing tiles when the left mouse button is pressed down
function downCoords(event) {
    if (event.which == 3 || event.button == 2) {
        // Set right click variable to true
        rightMouseDown = true;

        // Capture mouse positions for getCoelescedEvents() function
        canvas.setPointerCapture(1);

        // Make UI transparent and ignore pointer events
        for (let i = 0; i < uiElements.length; i++) {
            uiElements[i].style.pointerEvents = "none";
            uiElements[i].style.opacity = "0.5";
            uiElements[i].style.zIndex = 2;
        }
        
        // Get mouse x,y
        var { x, y } = getMousePosition(event);

        // Set oldX and oldY to current position on tilemap
        oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
        oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;

        // Set cursor to select if there are no tiles there (will likely be removed after infinite update)
        if (mapData[y] == undefined && mapData[y][x] == undefined) {
            c.style.cursor = "url(img/cursors/Select-32.png), auto";
        }

        if (mapData[y] != undefined && mapData[y][x] != undefined) {
            if (tool == "eraser") {
                // Set cursor to paintbrushed pressed down
                c.style.cursor = "url(img/cursors/PaintDown-32.png), auto";

                // Set tile at mouse pos to newest tile id
                if (mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                    mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;

                    // Update canvas
                    drawLayer(
                        Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                        Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                        Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                    );
                }
            } else if (tool == "pen") {
                // Set cursor to eraser pressed down
                c.style.cursor = "url(img/cursors/EraserDown-32.png), auto";

                if (mapData[y][x] != 0) {
                    // Set tile at cursor position to a blank tile
                    mapData[y][x] = 0;

                    // Update canvas
                    drawLayer(
                        Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                        Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                        Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                    );
                }
            } else if (tool == "select") {
                // Set the cursor select
                c.style.cursor = "url(img/cursors/Select-32.png), auto";

                // Set first two elements in selectRange to x and y and remove extra values
                selectRange[0] = x;
                selectRange[1] = y;
                selectRange.length = 2;

                // Set selected area in the export section
                filex.value = x;
                filey.value = y;
                filew.value = 1;
                fileh.value = 1;

                // Change download button text to say "Download Selected"
                downloadButton.innerText = "Download Selected";

                // Update canvas
                drawLayer(
                    Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                    Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                    Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                );
            }
        }
    } else if (event.which == 2 || event.button == 4) {
        console.log("middle click");
    } else {
        mouseDown = true;

        // Capture mouse positions for getCoelescedEvents() function
        canvas.setPointerCapture(1);

        // Make UI transparent and ignore pointer events
        for (let i = 0; i < uiElements.length; i++) {
            uiElements[i].style.pointerEvents = "none";
            uiElements[i].style.opacity = "0.5";
            uiElements[i].style.zIndex = 2;
        }
        
        // Get mouse x,y
        var { x, y } = getMousePosition(event);

        // Set oldX and oldY to current position on tilemap
        oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
        oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;

        // Set cursor to select if there are no tiles there (will likely be removed after infinite update)
        if (mapData[y] == undefined && mapData[y][x] == undefined) {
            c.style.cursor = "url(img/cursors/Select-32.png), auto";
        }

        if (mapData[y] != undefined && mapData[y][x] != undefined) {
            if (tool == "pen") {
                // Set cursor to paintbrushed pressed down
                c.style.cursor = "url(img/cursors/PaintDown-32.png), auto";

                // Set tile at mouse pos to newest tile id
                if (mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                    mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;

                    // Update canvas
                    drawLayer(
                        Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                        Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                        Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                    );
                }
            } else if (tool == "eraser") {
                // Set cursor to eraser pressed down
                c.style.cursor = "url(img/cursors/EraserDown-32.png), auto";

                if (mapData[y][x] != 0) {
                    // Set tile at cursor position to a blank tile
                    mapData[y][x] = 0;

                    // Update canvas
                    drawLayer(
                        Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                        Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                        Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                    );
                }
            } else if (tool == "select") {
                // Set the cursor select
                c.style.cursor = "url(img/cursors/Select-32.png), auto";

                // Set first two elements in selectRange to x and y and remove extra values
                selectRange[0] = x;
                selectRange[1] = y;
                selectRange.length = 2;

                // Set selected area in the export section
                filex.value = x;
                filey.value = y;
                filew.value = 1;
                fileh.value = 1;

                // Change download button text to say "Download Selected"
                downloadButton.innerText = "Download Selected";

                // Update canvas
                drawLayer(
                    Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                    Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                    Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                );
            }
        }
    }
}


// Function for getting the pixels on a line from startX, startY to endX, endY
// Used for filling in tiles with getCoalescedEvents() to draw tiles even when the mouse is moving too fast to register
function getPixelsOnLine(startX, startY, endX, endY){
    // Variable for storing result
    const pixelCols = [];

    // Set x and y value to tile position value
    const getPixel = (x,y) => {
        x = Math.floor(x / JSON.parse(tileScale.value));
        y = Math.floor(y / JSON.parse(tileScale.value));
        return { x, y };
    }

    // Set startX and startY variables to integers
    var x = Math.floor(startX);
    var y = Math.floor(startY);

    // Set endX and endY variables into integers
    const xx = Math.floor(endX);
    const yy = Math.floor(endY);

    // Get x width
    const dx = Math.abs(xx - x);

    // If startX is less than endX then result 1 otherwise result -1
    const sx = x < xx ? 1 : -1;

    // Get y height
    const dy = -Math.abs(yy - y);

    // If startY is less than endY then result 1 otherwise result -1
    const sy = y < yy ? 1 : -1;

    // Create variable for width and height added together
    var err = dx + dy;

    // Variable for storing things later on
    var e2;

    // Set up while loop
    var end = false;
    while (!end) {
        // Add tile position to result array
        pixelCols.push(getPixel(x,y));

        // If startX is exactly the same as endX and startY is exactly the same as endY then stop repeating
        if ((x === xx && y === yy)) {
            end = true;
        } else {
            // Set e2 to 2 times the added width and height of the line
            e2 = 2 * err;

            // If e2 is now greater than or equal to the height then add the height to err and add either 1 or -1 to x
            if (e2 >= dy) {
                err += dy;
                x += sx;
            }

            // If e2 is greater than or equal to the width then add the width to err and add either 1 or -1 to y
            if (e2 <= dx) {
                err += dx;
                y += sy;
            }
        }
    }

    // Result pixelCols variable
    return pixelCols;
}

// Function for deleting duplicate pixels from getPixelsOnLine()
function deletePixels(pixels) {
    // For the length of pixels, repeat for the length of pixels
    for (let i2 = 0; i2 < pixels.length-1; i2++) {
        for (let i = 0; i < pixels.length-1; i++) {
            // If the pixel in this loop is the exact same as the pixel in the other loop
            if (pixels[i].x == pixels[i2].x && pixels[i].y == pixels[i2].y) {
                // Remove pixel at x and y
                pixels.splice(i, 1);
            }
        }
    }
}

// Function for when cursor is moving
function moveCoords(event) {
    // If the getCoalescedEvents() function exists (for example not on Safari)
        if (event.getCoalescedEvents) {
        // Set variables x and y to mouse position on tilemap
        var { x, y } = getMousePosition(event);

        // If there is no tile under the cursor (including blank tiles) then set the cursor to select (in future: make it end function)
        if (mapData[y] == undefined && mapData[y][x] == undefined) {
            c.style.cursor = "url(img/cursors/Select-32.png), auto";
        }

        // If right click is held down
        if (rightMouseDown) {
            // If there is a tile that exists at x,y
            if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                    if (tool == "pen") {
                        // Set cursor to eraser pressed down
                        c.style.cursor = "url(img/cursors/EraserDown-32.png), auto";

                        // Empty the selectRange variable to hide selection box
                        if (selectRange.length != 0) {
                            selectRange.length = 0;
                        }

                        // If tile is not a blank tile already
                        if (mapData[y][x] != 0) {
                            // If there is no oldX or oldY
                            if (oldX == null && oldY == null) {
                                if ( mapData[y][x] != 0) {
                                    mapData[y][x] = 0;
                                    oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                    oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                }
                            } else {
                                // Use the oldX and oldY to get the pixels on the line and fill in the gaps
                                var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*tileScale.value)+tileScale.value/2,Math.ceil(y*tileScale.value)+tileScale.value/2);
                                deletePixels(pixels);

                                // Set tiles in pixels variable to blank tiles
                                for (let i = 0; i < pixels.length; i++) {
                                    if ( mapData[pixels[i].y][pixels[i].x] != 0) {
                                        mapData[pixels[i].y][pixels[i].x] = 0;
                                        oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                        oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                    }
                                }
                            }
    
                            // Update canvas
                            drawLayer(
                                Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                                Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                            );
                        } else {
                            // Set oldX and oldY to null if mapData[y][x] is already 0
                            oldX = null;
                            oldY = null;
                        }
                    } else if (tool == "eraser") {
                        // Set cursor to paintbrush pressed down
                        c.style.cursor = "url(img/cursors/PaintDown-32.png), auto";

                        // Empty the selectRange variable to hide selection box
                        if (selectRange.length != 0) {
                            selectRange.length = 0;
                        }

                        // If tile is not already newest tile type
                        if (mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                            // If there is no oldX or oldY
                            if (oldX == null && oldY == null) {
                                if ( mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                    mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                    oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                    oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                }
                            } else {
                                // Use the oldX and oldY to get the pixels on the line and fill in the gaps
                                var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*tileScale.value)+tileScale.value/2,Math.ceil(y*tileScale.value)+tileScale.value/2);
                                deletePixels(pixels);

                                // Set tiles in pixels variable to latest tile type
                                for (let i = 0; i < pixels.length; i++) {
                                    if ( mapData[pixels[i].y][pixels[i].x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                        mapData[pixels[i].y][pixels[i].x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                        oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                        oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                    }
                                }
                            }
    
                            // Update canvas
                            drawLayer(
                                Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                                Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                            );
                        } else {
                            // Set oldX and oldY to null if mapData[y][x] is already the latest tile type
                            oldX = null;
                            oldY = null;
                        }
                    }
                }
            }
        } else if (mouseDown) {
            // If left click is held down
            // If there is a tile that exists at x,y
            if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                if (tool == "pen") {
                    // Set cursor to paintbrush held down
                    c.style.cursor = "url(img/cursors/PaintDown-32.png), auto";

                    // Empty the selectRange variable to hide selection box
                        if (selectRange.length != 0) {
                        selectRange.length = 0;
                    }

                    // If tile is not already latest tile type
                    if (mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                        // If there is no oldX or oldY
                        if (oldX == null && oldY == null) {
                            if ( mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                            }
                        } else {
                            // Use the oldX and oldY variables to get the pixels on the line and fill in the gaps
                            var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*tileScale.value)+tileScale.value/2,Math.ceil(y*tileScale.value)+tileScale.value/2);
                            deletePixels(pixels);

                            // Set tiles to latest tile type
                            for (let i = 0; i < pixels.length; i++) {
                                if ( mapData[pixels[i].y][pixels[i].x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                    mapData[pixels[i].y][pixels[i].x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                    oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                    oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                }
                            }
                            }

                            // Update canvas
                            drawLayer(
                                Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                                Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                            );
                        } else {
                            // Set oldX and oldY variables to null if mapData[y][x] is already the latest tile type
                            oldX = null;
                            oldY = null;
                        }
                    } else if (tool == "eraser") {
                        // Set cursor to eraser pressed down
                        c.style.cursor = "url(img/cursors/EraserDown-32.png), auto";

                        // Empty the selectRange variable to hide selection box
                        if (selectRange.length != 0) {
                            selectRange.length = 0;
                        }

                        // If tile is not already blank
                        if (mapData[y][x] != 0) {
                            // If there is no oldX or oldY
                            if (oldX == null && oldY == null) {
                                if ( mapData[y][x] != 0) {
                                    mapData[y][x] = 0;
                                    oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                    oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                }
                            } else {
                                // Use the oldX and oldY to get the pixels on the line and fill in the gaps
                                var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*tileScale.value)+tileScale.value/2,Math.ceil(y*tileScale.value)+tileScale.value/2);
                                deletePixels(pixels);

                                // Set tiles to blank
                                for (let i = 0; i < pixels.length; i++) {
                                    if ( mapData[pixels[i].y][pixels[i].x] != 0) {
                                        mapData[pixels[i].y][pixels[i].x] = 0;
                                        oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                        oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                    }
                                }
                            }

                            // Update canvas
                            drawLayer(
                                Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                                Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                            );
                        } else {
                            // Set oldX and oldY to null if mapData[y][x] is already blank
                            oldX = null;
                            oldY = null;
                        }
                    } else if (tool == "select") {
                        // Set cursor to select
                        c.style.cursor = "url(img/cursors/Select-32.png), auto";

                        // Set end x and end y of select range
                        selectRange[2] = x;
                        selectRange[3] = y;
                        
                        // If start x is less than or equal to end x and start y is less than or equal to end y
                        if (selectRange[0]<=selectRange[2]&&selectRange[1]<=selectRange[3]) {
                            // Set file width to end x minus start x plus 1
                            filew.value = selectRange[2] - selectRange[0] + 1;

                            // Set file height to end y minus start y plus 1
                            fileh.value = selectRange[3] - selectRange[1] + 1;
                        } else {
                            // Set file x and y to end x and end y
                            filex.value = selectRange[2];
                            filey.value = selectRange[3];

                            // Set file width to end x minus start x plus 1
                            filew.value = selectRange[0] - selectRange[2] + 1;

                            // Set file height to end y minus start y plus 1
                            fileh.value = selectRange[1] - selectRange[3] + 1;
                        }

                        // Update canvas
                        drawLayer(
                            Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                            Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                            Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                        );
                    }
                }
            } else {
                // If mouse isn't down and there is a tile under the cursor
                if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                    if (tool == "pen") {
                        // Set cursor to paintbrush
                        c.style.cursor = "url(img/cursors/Paint-32.png), auto";
                    } else if (tool == "eraser") {
                        // Set cursor to eraser
                        c.style.cursor = "url(img/cursors/Eraser-32.png), auto";
                    } else if (tool == "select") {
                        // Set cursor to select
                        c.style.cursor = "url(img/cursors/Select-32.png), auto";
                    }
                }
            }
    } else {
        // If getCoalescedEvents() function does not exist
        // Set x and y to mouse position on tilemap
        var { x, y } = getMousePosition(event);

        // If there is no tile under the cursor (including blank tiles) then set the cursor to select
        if (mapData[y] == undefined && mapData[y][x] == undefined) {
            c.style.cursor = "url(img/cursors/Select-32.png), auto";
        }

        if (rightMouseDown) {
            // If there is a tile that exists at x,y
            if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                    if (tool == "pen") {
                        // Set cursor to eraser pressed down
                        c.style.cursor = "url(img/cursors/EraserDown-32.png), auto";

                        // Empty the selectRange variable to hide selection box
                        if (selectRange.length != 0) {
                            selectRange.length = 0;
                        }

                        // If tile is not a blank tile already
                        if (mapData[y][x] != 0) {
                            // If there is no oldX or oldY
                            if (oldX == null && oldY == null) {
                                if ( mapData[y][x] != 0) {
                                    mapData[y][x] = 0;
                                    oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                    oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                }
                            } else {
                                // Use the oldX and oldY to get the pixels on the line and fill in the gaps
                                var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*tileScale.value)+tileScale.value/2,Math.ceil(y*tileScale.value)+tileScale.value/2);
                                deletePixels(pixels);

                                // Set tiles in pixels variable to blank tiles
                                for (let i = 0; i < pixels.length; i++) {
                                    if ( mapData[pixels[i].y][pixels[i].x] != 0) {
                                        mapData[pixels[i].y][pixels[i].x] = 0;
                                        oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                        oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                    }
                                }
                            }
    
                            // Update canvas
                            drawLayer(
                                Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                                Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                            );
                        } else {
                            // Set oldX and oldY to null if mapData[y][x] is already 0
                            oldX = null;
                            oldY = null;
                        }
                    } else if (tool == "eraser") {
                        // Set cursor to paintbrush pressed down
                        c.style.cursor = "url(img/cursors/PaintDown-32.png), auto";

                        // Empty the selectRange variable to hide selection box
                        if (selectRange.length != 0) {
                            selectRange.length = 0;
                        }

                        // If tile is not already newest tile type
                        if (mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                            // If there is no oldX or oldY
                            if (oldX == null && oldY == null) {
                                if ( mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                    mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                    oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                    oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                }
                            } else {
                                // Use the oldX and oldY to get the pixels on the line and fill in the gaps
                                var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*tileScale.value)+tileScale.value/2,Math.ceil(y*tileScale.value)+tileScale.value/2);
                                deletePixels(pixels);

                                // Set tiles in pixels variable to latest tile type
                                for (let i = 0; i < pixels.length; i++) {
                                    if ( mapData[pixels[i].y][pixels[i].x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                        mapData[pixels[i].y][pixels[i].x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                        oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                        oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                    }
                                }
                            }
    
                            // Update canvas
                            drawLayer(
                                Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                                Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                            );
                        } else {
                            // Set oldX and oldY to null if mapData[y][x] is already the latest tile type
                            oldX = null;
                            oldY = null;
                        }
                    }
                }
            }
        } else if (mouseDown) {
            // If left click is held down
            // If there is a tile that exists at x,y
            if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                if (tool == "pen") {
                    // Set cursor to paintbrush held down
                    c.style.cursor = "url(img/cursors/PaintDown-32.png), auto";

                    // Empty the selectRange variable to hide selection box
                        if (selectRange.length != 0) {
                        selectRange.length = 0;
                    }

                    // If tile is not already latest tile type
                    if (mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                        // If there is no oldX or oldY
                        if (oldX == null && oldY == null) {
                            if ( mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                            }
                        } else {
                            // Use the oldX and oldY variables to get the pixels on the line and fill in the gaps
                            var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*tileScale.value)+tileScale.value/2,Math.ceil(y*tileScale.value)+tileScale.value/2);
                            deletePixels(pixels);

                            // Set tiles to latest tile type
                            for (let i = 0; i < pixels.length; i++) {
                                if ( mapData[pixels[i].y][pixels[i].x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                    mapData[pixels[i].y][pixels[i].x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                    oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                    oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                }
                            }
                            }

                            // Update canvas
                            drawLayer(
                                Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                                Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                            );
                        } else {
                            // Set oldX and oldY variables to null if mapData[y][x] is already the latest tile type
                            oldX = null;
                            oldY = null;
                        }
                    } else if (tool == "eraser") {
                        // Set cursor to eraser pressed down
                        c.style.cursor = "url(img/cursors/EraserDown-32.png), auto";

                        // Empty the selectRange variable to hide selection box
                        if (selectRange.length != 0) {
                            selectRange.length = 0;
                        }

                        // If tile is not already blank
                        if (mapData[y][x] != 0) {
                            // If there is no oldX or oldY
                            if (oldX == null && oldY == null) {
                                if ( mapData[y][x] != 0) {
                                    mapData[y][x] = 0;
                                    oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                    oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                }
                            } else {
                                // Use the oldX and oldY to get the pixels on the line and fill in the gaps
                                var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*tileScale.value)+tileScale.value/2,Math.ceil(y*tileScale.value)+tileScale.value/2);
                                deletePixels(pixels);

                                // Set tiles to blank
                                for (let i = 0; i < pixels.length; i++) {
                                    if ( mapData[pixels[i].y][pixels[i].x] != 0) {
                                        mapData[pixels[i].y][pixels[i].x] = 0;
                                        oldX = Math.ceil(x*tileScale.value)+tileScale.value/2;
                                        oldY = Math.ceil(y*tileScale.value)+tileScale.value/2;
                                    }
                                }
                            }

                            // Update canvas
                            drawLayer(
                                Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                                Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                            );
                        } else {
                            // Set oldX and oldY to null if mapData[y][x] is already blank
                            oldX = null;
                            oldY = null;
                        }
                    } else if (tool == "select") {
                        // Set cursor to select
                        c.style.cursor = "url(img/cursors/Select-32.png), auto";

                        // Set end x and end y of select range
                        selectRange[2] = x;
                        selectRange[3] = y;
                        
                        // If start x is less than or equal to end x and start y is less than or equal to end y
                        if (selectRange[0]<=selectRange[2]&&selectRange[1]<=selectRange[3]) {
                            // Set file width to end x minus start x plus 1
                            filew.value = selectRange[2] - selectRange[0] + 1;

                            // Set file height to end y minus start y plus 1
                            fileh.value = selectRange[3] - selectRange[1] + 1;
                        } else {
                            // Set file x and y to end x and end y
                            filex.value = selectRange[2];
                            filey.value = selectRange[3];

                            // Set file width to end x minus start x plus 1
                            filew.value = selectRange[0] - selectRange[2] + 1;

                            // Set file height to end y minus start y plus 1
                            fileh.value = selectRange[1] - selectRange[3] + 1;
                        }

                        // Update canvas
                        drawLayer(
                            Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                            Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                            Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
                        );
                    }
                }
        } else {
            // If mouse isn't down and there is a tile under the cursor
            if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                if (tool == "pen") {
                    // Set cursor to paintbrush
                    c.style.cursor = "url(img/cursors/Paint-32.png), auto";
                } else if (tool == "eraser") {
                    // Set cursor to eraser
                    c.style.cursor = "url(img/cursors/Eraser-32.png), auto";
                } else if (tool == "select") {
                    // Set cursor to select
                    c.style.cursor = "url(img/cursors/Select-32.png), auto";
                }
            }
        }
    }
}

// Function for when mouse button is released
function upCoords(event) {
    // Stop capturing mouse position
    canvas.releasePointerCapture(1);

    // Make UI transparent and ignore pointer events
    for (let i = 0; i < uiElements.length; i++) {
        uiElements[i].style.pointerEvents = "auto";
        uiElements[i].style.opacity = "1";
        uiElements[i].style.zIndex = "";
    }

    // Set left click and right click variables to false
    mouseDown = false;
    rightMouseDown = false;

    // Get mouse position
    var { x, y } = getMousePosition(event);

    // If there is no tile under the cursor set cursor to select
    if (mapData[y] == undefined && mapData[y][x] == undefined) {
        c.style.cursor = "url(img/cursors/Select-32.png), auto";
    }

    if (tool == "pen") {
        // Set cursor to paintbrush
        c.style.cursor = "url(img/cursors/Paint-32.png), auto";
    } else if (tool == "eraser") {
        // Set cursor to eraser
        c.style.cursor = "url(img/cursors/Eraser-32.png), auto";
    } else if (tool == "select") {
        // Set cursor to select
        c.style.cursor = "url(img/cursors/Select-32.png), auto";
    }

    // Save tilemap to storage
    saveTilemap();
}

// Function for when a key is pressed (future: make to work with tool selection buttons)
function keypress(event) {
    if (event.srcElement.tagName != "INPUT") {
        // // Stop the default result of the key press
        event.preventDefault();

        // If the key is a certain key then do the action
        if(event.key == 'r'){
            // Reset the whole tilemap and tile types
            resetTiles();
        } else if(event.key == '1'){
            // Set tool to select and save to storage
            setTool('select');
            tool = 'select';
            localStorage.setItem('tool', 'select')
        } else if(event.key == '2'){
            // Set tool to pen and save to storage
            setTool('pen');
            tool = 'pen';
            localStorage.setItem('tool', 'pen')
        } else if(event.key == '3'){
            // Set tool to eraser and save to storage
            setTool('eraser');
            tool = 'eraser';
            localStorage.setItem('tool', 'eraser')
        } else if(event.key == '4'){
            // Set tool to fill and save to storage
            setTool('fill');
            tool = 'fill';
            localStorage.setItem('tool', 'fill')
        } else if(event.key == '5'){
            // Set tool to eyedropper and save to storage
            setTool('dropper');
            tool = 'dropper';
            localStorage.setItem('tool', 'dropper')
        }
    }
}

// Function for when a command is pressed (e.g. ctrl + s, cmd + s)
function keydown(event) {
    // If meta key (ctrl, cmd) is pressed along with a specific key then do the action
    if (event.metaKey && event.key == 's') {
        // Stop default result of the command
        event.preventDefault();

        // Export as a .cstiles file
        exportTilemap(
            "cstiles",
            document.getElementById('filex').value,
            document.getElementById('filey').value,
            document.getElementById('filew').value,
            document.getElementById('fileh').value
        )
    } else if (event.metaKey && event.key == '=' && event.shiftKey) {
        // Stop default result of the command
        event.preventDefault();

        // Increase the view scale of the tiles
        tileScale.value = tileScale.value + 10;

        if(JSON.parse(tileScale.value) < 1) {
            tileScale.value = 1
        } else if(tileScale.value == '') {
            tileScale.value = 1;
        }

        if(window.innerWidth > window.innerHeight){
            if(JSON.parse(tileScale.value) > window.innerWidth){
                tileScale.value = window.innerWidth;
            }
        } else {
            if(JSON.parse(tileScale.value) > window.innerHeight){
                tileScale.value = window.innerHeight;
            }
        }

        drawLayer(
            Math.ceil(canvas.width/tileScale.value)*(document.getElementById('scrollx-container').scrollLeft/document.getElementById('scrollx-container').clientWidth),
            Math.ceil(canvas.height/tileScale.value)*(document.getElementById('scrolly-container').scrollTop/document.getElementById('scrolly-container').clientHeight),
            Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
        );
    } else if (event.metaKey && event.key == '-' && event.shiftKey) {
        // Stop default result of the command
        event.preventDefault();

        // Decrease the view scale of the tiles
        tileScale.value = tileScale.value - 10;
        
        if(JSON.parse(tileScale.value) < 1) {
            tileScale.value = 1
        } else if(tileScale.value == '') {
            tileScale.value = 1;
        }

        if(window.innerWidth > window.innerHeight){
            if(JSON.parse(tileScale.value) > window.innerWidth){
                tileScale.value = window.innerWidth;
            }
        } else {
            if(JSON.parse(tileScale.value) > window.innerHeight){
                tileScale.value = window.innerHeight;
            }
        }

        drawLayer(
            Math.ceil(canvas.width/tileScale.value)*(document.getElementById('scrollx-container').scrollLeft/document.getElementById('scrollx-container').clientWidth),
            Math.ceil(canvas.height/tileScale.value)*(document.getElementById('scrolly-container').scrollTop/document.getElementById('scrolly-container').clientHeight),
            Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
        );
    } else if (event.metaKey && event.key == '=') {
        // Stop default result of the command
        event.preventDefault();

        // Increase the view scale of the tiles
        tileScale.value = tileScale.value + 1;

        if(JSON.parse(tileScale.value) < 1) {
            tileScale.value = 1
        } else if(tileScale.value == '') {
            tileScale.value = 1;
        }

        if(window.innerWidth > window.innerHeight){
            if(JSON.parse(tileScale.value) > window.innerWidth){
                tileScale.value = window.innerWidth;
            }
        } else {
            if(JSON.parse(tileScale.value) > window.innerHeight){
                tileScale.value = window.innerHeight;
            }
        }

        drawLayer(
            Math.ceil(canvas.width/tileScale.value)*(document.getElementById('scrollx-container').scrollLeft/document.getElementById('scrollx-container').clientWidth),
            Math.ceil(canvas.height/tileScale.value)*(document.getElementById('scrolly-container').scrollTop/document.getElementById('scrolly-container').clientHeight),
            Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
        );
    } else if (event.metaKey && event.key == '-') {
        // Stop default result of the command
        event.preventDefault();

        // Decrease the view scale of the tiles
        tileScale.value = tileScale.value - 1;
        
        if(JSON.parse(tileScale.value) < 1) {
            tileScale.value = 1
        } else if(tileScale.value == '') {
            tileScale.value = 1;
        }

        if(window.innerWidth > window.innerHeight){
            if(JSON.parse(tileScale.value) > window.innerWidth){
                tileScale.value = window.innerWidth;
            }
        } else {
            if(JSON.parse(tileScale.value) > window.innerHeight){
                tileScale.value = window.innerHeight;
            }
        }

        drawLayer(
            Math.ceil(canvas.width/tileScale.value)*(document.getElementById('scrollx-container').scrollLeft/document.getElementById('scrollx-container').clientWidth),
            Math.ceil(canvas.height/tileScale.value)*(document.getElementById('scrolly-container').scrollTop/document.getElementById('scrolly-container').clientHeight),
            Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
        );
    } else if (event.metaKey && event.key == 'z' && event.shiftKey) {
        // Stop default result of the command
        event.preventDefault();

        // Redo the last action (WIP)
        console.log("redo");
    } else if (event.metaKey && event.key == 'z' || event.ctrlKey && event.key == 'y') {
        // Stop default result of the command
        event.preventDefault();

        // Undo the last action (WIP)
        console.log("undo");
    }
}

// Function for when the page is scrolled (touchpad or mouse wheel)
function scrollCoords(event) {
    // If pinch to zoom on trackpad
    if(event.ctrlKey) {
        if (event.deltaY > 0) {
            // Decrease the view scale of the tiles
            tileScale.value -=1;
            
            if(JSON.parse(tileScale.value) < 1) {
                tileScale.value = 1
            } else if(tileScale.value == '') {
                tileScale.value = 1;
            }

            if(window.innerWidth > window.innerHeight){
                if(JSON.parse(tileScale.value) > window.innerWidth){
                    tileScale.value = window.innerWidth;
                }
            } else {
                if(JSON.parse(tileScale.value) > window.innerHeight){
                    tileScale.value = window.innerHeight;
                }
            }

            drawLayer(
                Math.ceil(canvas.width/tileScale.value)*(document.getElementById('scrollx-container').scrollLeft/document.getElementById('scrollx-container').clientWidth),
                Math.ceil(canvas.height/tileScale.value)*(document.getElementById('scrolly-container').scrollTop/document.getElementById('scrolly-container').clientHeight),
                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true,"zoom out"
            );
        } else {
            // Increase the view scale of the tiles
            tileScale.value += 1;
            
            if(JSON.parse(tileScale.value) < 1) {
                tileScale.value = 1
            } else if(tileScale.value == '') {
                tileScale.value = 1;
            }

            if(window.innerWidth > window.innerHeight){
                if(JSON.parse(tileScale.value) > window.innerWidth){
                    tileScale.value = window.innerWidth;
                }
            } else {
                if(JSON.parse(tileScale.value) > window.innerHeight){
                    tileScale.value = window.innerHeight;
                }
            }

            drawLayer(
                Math.ceil(canvas.width/tileScale.value)*(document.getElementById('scrollx-container').scrollLeft/document.getElementById('scrollx-container').clientWidth),
                Math.ceil(canvas.height/tileScale.value)*(document.getElementById('scrolly-container').scrollTop/document.getElementById('scrolly-container').clientHeight),
                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true,"zoom in"
            );
        }
    } else if (!event.ctrlKey && event.deltaY && !Number.isInteger(event.deltaY)) {
        // Detect if mouse wheel is used
        // Zoom in with mouse scroll if deltaY is greater than 0 otherwise zoom out
        if (event.deltaY > 0) {
            // Decrease the view scale of the tiles
            tileScale.value = tileScale.value - 1;
            
            if(JSON.parse(tileScale.value) < 1) {
                tileScale.value = 1
            } else if(tileScale.value == '') {
                tileScale.value = 1;
            }

            if(window.innerWidth > window.innerHeight){
                if(JSON.parse(tileScale.value) > window.innerWidth){
                    tileScale.value = window.innerWidth;
                }
            } else {
                if(JSON.parse(tileScale.value) > window.innerHeight){
                    tileScale.value = window.innerHeight;
                }
            }

            drawLayer(
                Math.ceil(canvas.width/tileScale.value)*(document.getElementById('scrollx-container').scrollLeft/document.getElementById('scrollx-container').clientWidth),
                Math.ceil(canvas.height/tileScale.value)*(document.getElementById('scrolly-container').scrollTop/document.getElementById('scrolly-container').clientHeight),
                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true,
            );
        } else {
            // Increase the view scale of the tiles
            tileScale.value += 1;
            
            if(JSON.parse(tileScale.value) < 1) {
                tileScale.value = 1
            } else if(tileScale.value == '') {
                tileScale.value = 1;
            }

            if(window.innerWidth > window.innerHeight){
                if(JSON.parse(tileScale.value) > window.innerWidth){
                    tileScale.value = window.innerWidth;
                }
            } else {
                if(JSON.parse(tileScale.value) > window.innerHeight){
                    tileScale.value = window.innerHeight;
                }
            }

            drawLayer(
                Math.ceil(canvas.width/tileScale.value)*(document.getElementById('scrollx-container').scrollLeft/document.getElementById('scrollx-container').clientWidth),
                Math.ceil(canvas.height/tileScale.value)*(document.getElementById('scrolly-container').scrollTop/document.getElementById('scrolly-container').clientHeight),
                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true,
            );
        }
    } else {
        // If touchpad is used on canvas then scroll tilemap
        if (event.srcElement == canvas) {
            document.getElementById("scrollx-container").scrollLeft -= event.deltaX;
            document.getElementById("scrolly-container").scrollTop -= event.deltaY;
        }
    }

    // Update canvas
    drawLayer(
        Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
        Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
        Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
    );
}

// Function for resetting everything
function resetTiles() {
    document.getElementById("reset").style.backgroundColor = "#ffa500";
    document.getElementById("reset").style.fontWeight = "bold";

    document.querySelectorAll(".toolsLayout .button").forEach(button => {
        button.style.backgroundColor = "";
        button.style.fontWeight = "";
    });

    showDialogBox("reset");
}

// Function for deleting duplicate tile types
function deleteTileTypes() {
    // Repeat over mapData, repeat over TILE_TYPES, if mapData does not include the tile then delete it
    for (let i = 0; i < mapData.length-1; i++) {
        for (let i = 0; i < TILE_TYPES.length-1; i++) {
            if (!JSON.stringify(mapData).includes(TILE_TYPES[i].id)) {
                TILE_TYPES.splice(i, 1);
            }
        }
    }

    // Repeat over TILE_TYPES, repeat over TILE_TYPES, if the tile from the first repeat is the exact same as the tile from the second repeat, repeat over mapData, if the tile is the tile that is the duplicate then delete it
    for (let i = 0; i < TILE_TYPES.length; i++) {
        for (let i2 = 0; i2 < TILE_TYPES.length; i2++) {
            if (TILE_TYPES[i].colour == TILE_TYPES[i2].colour && TILE_TYPES[i].outline == TILE_TYPES[i2].outline && TILE_TYPES[i].opacity == TILE_TYPES[i2].opacity) {
                for (let i3 = 0; i3 < mapData.length; i3++) {
                    for (let i4 = 0; i4 < mapData[0].length; i4++) {
                        if (mapData[i3][i4] == TILE_TYPES[i2].id){
                            mapData[i3][i4] = TILE_TYPES[i].id;
                        }
                    }
                } 
            }
        }
    }
}

// Secret function 🤫
function comingSoon(event){if(event.srcElement.classList.contains('button')&&!event.srcElement.classList.contains('disabled')){alert('Haha. Very funny. Sorry, but enabling the button isn\'t going to get you anywhere...')};}

// Function for importing a file (currently only .cstiles)
function importFile(event) {
    // Variable for the file being imported
    var file = event.srcElement.files[0];

    // Initialise file reader
    const reader = new FileReader();

    // When the file reader loads
    reader.addEventListener("load",() => {
        // Set TILE_TYPES to the fisrt string before a ~ in the .cstiles file
        TILE_TYPES = JSON.parse(reader.result.split('~')[0]);

        // Set mapData to the second string before a ~ in the .cstiles file
        mapData = JSON.parse(reader.result.split('~')[1]);

        // Save tilemap to storage
        saveTilemap();

        // Update canvas
        drawLayer(
            Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
            Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
            Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
        );
    }, false);

    // Read the file
    if (file) {
        reader.readAsText(file);
    }
}

// Function for exporting the tilemap with a file extension, x, y, width and height
function exportTilemap(type,x,y,w,h) {
    if (type == "cstiles") {
        // Create a link
        var dl = document.createElement("a");

        // Set the link's download's filename to be the cstiles file
        dl.download = document.getElementById("filename").value+".cstiles";

        // Set the link's download to the cstiles file (basically just renamed txt file)
        dl.href = "data:text/plain;utf-8,"+encodeURIComponent(JSON.stringify(TILE_TYPES)+"~"+JSON.stringify(mapData));

        // Automatically click the link to initiate download process
        dl.click();

        // Delete link
        delete dl;
    } else {
        // Set x and y to numbers and not strings
        x *= 1;
        y *= 1;

        // Set width and height to tile size
        w *= JSON.parse(tileScale.value);
        h *= JSON.parse(tileScale.value);

        if (type == undefined) {
            // If there is no type input clear the canvas
            ctx = c.getContext("2d");
            c.width = window.innerWidth;
            c.height = window.innerHeight;
            ctx.clearRect(0,0,c.width,c.height);
        } else if (type == "svg") {
            // If the file extension is svg then cerate a canvas2svg canvas
            ctx = new C2S(w,h);
        } else {
            // Otherwise change the size of the tilemap canvas to the export size
            ctx = c.getContext("2d");
            c.width = w-x;
            c.height = h-y;
            ctx.clearRect(0,0,c.width,c.height);
        }

        // Draw the tiles (without grid tiles)
        for (let yh = 0; yh < mapData.length-y; yh++) {
            for (let xw = 0; xw < mapData[0].length-x; xw++) {
                drawTile(xw+x,yh+y,-x,-y);
            }
        }

        if (type == "svg") {
            // Get svg from canvas2svg canvas
            var svg = ctx.getSvg();

            if (window.ActiveXObject) {
                // Set svgString to svg xml (for Internet Explorer)
                svgString = svg.xml;
            } else {
                // Get serialised svg and set svgString to the serialised srting
                var oSerializer = new XMLSerializer();
                svgString = oSerializer.serializeToString(svg);
            }

            // Create a link
            var dl = document.createElement("a");

            // Set the link's download's filename
            dl.download = document.getElementById("filename").value;

            // Add svg to download
            dl.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);

            // Automatically click link to initiate download process
            dl.click();

            // Delete the link
            delete dl;

            // Ste canvas context back to 2d context
            ctx = c.getContext("2d");
        } else if (type != undefined && type != "cstiles") {
            // Create a link
            var dl = document.createElement("a");

            // Set the link's download's filename
            dl.download = document.getElementById("filename").value;

            // Create an image of the canvas as the file extension
            dl.href = c.toDataURL("image/"+type);

            // Automatically click the link to initiate download process
            dl.click();

            // Delete the link
            delete dl;

            // Reset canvas size
            c.height = window.innerHeight;
            c.width = window.innerWidth;

            // Update canvas
            drawLayer(
                Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
                Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
                Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
            );
        }
    }
}

// When the mouse is down, trigger downCoords()
c.addEventListener('pointerdown', downCoords);

// When the page is scrolled, trigger scrollCoords()
c.addEventListener('wheel', scrollCoords, {passive: true});

// When the mouse moves, trigger moveCoords()
c.addEventListener('pointermove', moveCoords);

// When the mouse is released, trigger upCoords()
c.addEventListener('pointerup', upCoords);

/*
 * Gamepad API Test
 * Written in 2013 by Ted Mielczarek <ted@mielczarek.org>
 *
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 *
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

var haveEvents = 'GamepadEvent' in window;
var haveWebkitEvents = 'WebKitGamepadEvent' in window;
var controllers = {};
var rAF = window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.requestAnimationFrame;

function connecthandler(e) {
  addgamepad(e.gamepad);
}
function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad; var d = document.createElement("div");
  d.setAttribute("id", "controller" + gamepad.index);
  var t = document.createElement("h1");
  t.appendChild(document.createTextNode("gamepad: " + gamepad.id));
  d.appendChild(t);
  var b = document.createElement("div");
  b.className = "buttons";
  for (var i=0; i<gamepad.buttons.length; i++) {
    var e = document.createElement("span");
    e.className = "button";
    //e.id = "b" + i;
    e.innerHTML = i;
    b.appendChild(e);
  }
  d.appendChild(b);
  var a = document.createElement("div");
  a.className = "axes";
  for (i=0; i<gamepad.axes.length; i++) {
    e = document.createElement("meter");
    e.className = "axis";
    //e.id = "a" + i;
    e.setAttribute("min", "-1");
    e.setAttribute("max", "1");
    e.setAttribute("value", "0");
    e.innerHTML = i;
    a.appendChild(e);
  }
  d.appendChild(a);
  document.getElementById("start").style.display = "none";
  document.body.appendChild(d);
  rAF(updateStatus);
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  var d = document.getElementById("controller" + gamepad.index);
  document.body.removeChild(d);
  delete controllers[gamepad.index];
}

function updateStatus() {
  scangamepads();
  for (j in controllers) {
    var controller = controllers[j];
    var d = document.getElementById("controller" + j);
    var buttons = d.getElementsByClassName("button");
    for (var i=0; i<controller.buttons.length; i++) {
      var b = buttons[i];
      var val = controller.buttons[i];
      var pressed = val == 1.0;
      var touched = false;
      if (typeof(val) == "object") {
        pressed = val.pressed;
        if ('touched' in val) {
          touched = val.touched;
        }
        val = val.value;
      }
      var pct = Math.round(val * 100) + "%";
      b.style.backgroundSize = pct + " " + pct;
      b.className = "button";
      if (pressed) {
        b.className += " pressed";
      }
      if (touched) {
        b.className += " touched";
      }
    }

    var axes = d.getElementsByClassName("axis");
    for (var i=0; i<controller.axes.length; i++) {
      var a = axes[i];
      a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
      a.setAttribute("value", controller.axes[i]);
    }
  }
  rAF(updateStatus);
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && (gamepads[i].index in controllers)) {
      controllers[gamepads[i].index] = gamepads[i];
    }
  }
}

if (haveEvents) {
  window.addEventListener("gamepadconnected", connecthandler);
  window.addEventListener("gamepaddisconnected", disconnecthandler);
} else if (haveWebkitEvents) {
  window.addEventListener("webkitgamepadconnected", connecthandler);
  window.addEventListener("webkitgamepaddisconnected", disconnecthandler);
} else {
  setInterval(scangamepads, 500);
}

/* End of Gamepad API Test */

// Update canvas
drawLayer(
    Math.ceil(canvas.width/tileScale.value)*(document.getElementById("scrollx-container").scrollLeft/document.getElementById("scrollx-container").clientWidth),
    Math.ceil(canvas.height/tileScale.value)*(document.getElementById("scrolly-container").scrollTop/document.getElementById("scrolly-container").clientHeight),
    Math.ceil(canvas.width/tileScale.value),Math.ceil(canvas.height/tileScale.value),JSON.parse(tileScale.value),gridToggle.checked,true
);

// Set date variable to the current date
var date = new Date()

// Set time at top left to the date and time
document.getElementById("nav-info").innerText = date.toLocaleString('default', { date: '' });

// Function for updating the date variable
function getTime() {
    // Set date variable to the current date
    date = new Date();
    
    // Set time at top left to the date and time
    document.getElementById("nav-info").innerText = date.toLocaleString('default', { date: '' });
}

// Run getTime() once every every second
window.setInterval(getTime, 1000);