const c = document.createElement("canvas");
var ctx = c.getContext("2d");

c.height = window.innerHeight;
c.width = window.innerWidth;
c.setAttribute("id", "canvas");
document.body.appendChild(c);

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

if (sessionStorage.tilemap) {
    mapData = JSON.parse(sessionStorage.getItem("tilemap"));
} else {
    if (localStorage.tilemap) {
        mapData = JSON.parse(localStorage.getItem("tilemap"));
    } else {
        mapData = [];
        for (let i = 0; i < Math.ceil(c.height/64); i++) {
            mapData[i] = [];
            for (let i2 = 0; i2 < Math.ceil(c.width/64); i2++) {
                mapData[i][i2] = 0;
            }
        }
    }
}

function saveTilemap() {
    localStorage.setItem("tilemap", JSON.stringify(mapData));
    localStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));
    sessionStorage.setItem("tilemap", JSON.stringify(mapData));
    sessionStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));
}

const tileColour = document.getElementById("tileColour"); tileColour.value = TILE_TYPES[TILE_TYPES.length-1].colour;
const tileOutline = document.getElementById("tileOutline"); if(TILE_TYPES[TILE_TYPES.length-1].outline){tileOutline.value = TILE_TYPES[TILE_TYPES.length-1].outline; tileOutline.classList.add('disabled'); tileOutline.setAttribute('disabled', ''); document.getElementById("outlineCheck").checked=true}
const tileOpacity = document.getElementById("tileOpacity"); if(TILE_TYPES[TILE_TYPES.length-1].opacity){tileOpacity.value = TILE_TYPES[TILE_TYPES.length-1].opacity}
const tileShape = document.getElementById("tileShape"); if(TILE_TYPES[TILE_TYPES.length-1].shape){tileOpacity.value = TILE_TYPES[TILE_TYPES.length-1].shape}

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

const tileX = document.getElementById("tileX");
const tileY = document.getElementById("tileY");
const tileDeg = document.getElementById("tileDeg");

const filext = document.getElementById('filext');
const filex = document.getElementById('filex');
const filey = document.getElementById('filey');
const filew = document.getElementById('filew');
const fileh = document.getElementById('fileh');
const downloadButton = document.getElementById("downloadButton");

const dialogBox = document.getElementById("dialog");

function showDialogBox(content) {
    if (content == "about") {
        dialogBox.innerHTML='<form><h2>Tiles 2D</h2><br><h1>By <a href="https://cooki-studios.github.io" style="font-weight: bold;">Cooki Studios</a></h1><br><button formmethod="dialog">Close</button></form>'
        dialogBox.showModal();
    }
}

const selectRange = [];

function setTool(tool) {
    document.querySelectorAll(".toolsLayout .button").forEach(button => {
        button.style.backgroundColor = '';
    });

    tool = document.getElementById(tool+" tool")

    if (tool.srcElement == undefined) {
        tool.style.backgroundColor = "#ffa500";
    } else {
        tool.srcElement.style.backgroundColor = "#ffa500";
    }
    
}

if (!localStorage.tool) {
    setTool("pen");
} else {
    if (!sessionStorage.tool) {
        setTool("pen");
    }
}

function createTileType() {
    TILE_TYPES[TILE_TYPES.length] = { id: TILE_TYPES[TILE_TYPES.length-1].id+1, colour: tileColour.value }

    if (document.getElementById('outlineCheck').checked) {
        TILE_TYPES[TILE_TYPES.length-1].outline = tileOutline.value
    }

    if (tileOpacity.value) {
        TILE_TYPES[TILE_TYPES.length-1].opacity = tileOpacity.value
    }

    if (tileShape.value != "square") {
        TILE_TYPES[TILE_TYPES.length-1].shape = tileShape.value
    }
}

function drawLayer(lx,ly,lw,lh,grid,showSelect) {
    ctx.clearRect(0,0,c.width,c.height);

    if (lw && lh) {
        for (let y = 0; y < lh; y++) {
            for (let x = 0; x < lw; x++) {
                drawTile(x,y,lx,ly,showSelect);
            }
        }

        if (grid) {
            for (let y = 0; y < lh; y++) {
                for (let x = 0; x < lw; x++) {
                    drawGridTile(x+lx,y+ly);
                }
            }
        }
    } else {
        for (let y = 0; y < mapData.length; y++) {
            for (let x = 0; x < mapData[0].length; x++) {
                drawTile(x,y,lx,ly,showSelect);
            }
        }

        if (grid) {
            for (let y = 0; y < mapData.length; y++) {
                for (let x = 0; x < mapData[0].length; x++) {
                    drawGridTile(x+lx,y+ly);
                }
            }
        }
    }
}

function drawTile(x,y,lx,ly,showSelect) {
    if (mapData[y][x] != 0) {
        for (let i = 0; i < TILE_TYPES.length; i++) {
            if (TILE_TYPES[i].id == mapData[y][x]) {

                x += lx;
                y += ly;

                ctx.fillStyle = TILE_TYPES[i].colour;

                if (TILE_TYPES[i].opacity) {
                    ctx.globalAlpha = TILE_TYPES[i].opacity/100;
                }

                if (!TILE_TYPES[i].shape) {
                    ctx.fillRect(Math.ceil(x*64),Math.ceil(y*64),64,64);
                } else if (TILE_TYPES[i].shape == "triangle") {
                    ctx.beginPath();
                    ctx.moveTo((Math.ceil(x*64))+64,Math.ceil(y*64));
                    ctx.lineTo((Math.ceil(x*64))+64,(Math.ceil(y*64))+64);
                    ctx.lineTo(Math.ceil(x*64), (Math.ceil(y*64))+64);
                    ctx.closePath();
                    ctx.fill();
                } else if (TILE_TYPES[i].shape == "thin-triangle") {
                    ctx.beginPath();
                    ctx.moveTo((Math.ceil(x*64))+64, (Math.ceil(y*64)));
                    ctx.lineTo((Math.ceil(x*64))+64, (Math.ceil(y*64))+64);
                    ctx.lineTo((Math.ceil(x*64))+32, (Math.ceil(y*64))+64);
                    ctx.closePath();
                    ctx.fill();
                } else if (TILE_TYPES[i].shape == "curve") {
                    ctx.beginPath();
                    ctx.arc((Math.ceil(x*64))+64, (Math.ceil(y*64))+64, 64, 1 * Math.PI, 1.5 * Math.PI);
                    ctx.lineTo((Math.ceil(x*64))+64, (Math.ceil(y*64))+64);
                    ctx.lineTo((Math.ceil(x*64)), (Math.ceil(y*64))+64);
                    ctx.closePath();
                    ctx.fill();
                } else if (TILE_TYPES[i].shape == "reverse-curve") {
                    ctx.beginPath();
                    ctx.arc((Math.ceil(x*64)), (Math.ceil(y*64)), 64, 0 * Math.PI, 0.5 * Math.PI);
                    ctx.lineTo((Math.ceil(x*64))+64, (Math.ceil(y*64))+64);
                    ctx.lineTo((Math.ceil(x*64))+64, (Math.ceil(y*64))+64);
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.globalAlpha = 1;

                if (showSelect) {
                    if (selectRange[0]==x&&selectRange[1]==y||((x>=selectRange[0]&&x<=selectRange[2])||(x<=selectRange[0]&&x>=selectRange[2]))&&((y>=selectRange[1]&&y<=selectRange[3])||(y<=selectRange[1]&&y>=selectRange[3]))) {
                        ctx.globalAlpha = 0.25;
                        ctx.fillStyle = "#4287f5";
                        ctx.fillRect(Math.ceil(x*64),Math.ceil(y*64),64,64);
                
                        ctx.globalAlpha = 1;
                    }
                }

                if (TILE_TYPES[i].outline) {
                    ctx.strokeStyle = TILE_TYPES[i].outline;
                    ctx.strokeRect(Math.ceil(x*64),Math.ceil(y*64),64,64);
                }
            }
        }
    }
}

function drawGridTile(x,y) {
    x *= 64;
    y *= 64;

    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = "2";
    ctx.strokeRect(x,y,64,64);
}

var mouseDown = false;
var rightMouseDown = false;
var lastPoint;

if (localStorage.getItem("tool") == undefined) {
    if (sessionStorage.getItem("tool") == undefined) {
        var tool = "pen";
    } else {
        var tool = sessionStorage.getItem("tool");
        document.getElementById(sessionStorage.getItem("tool")+" tool").style.backgroundColor = "#ffa500";
        document.getElementById(sessionStorage.getItem("tool")+" tool").style.borderRadius = "0.1rem";
    }
} else {
    var tool = localStorage.getItem("tool");
    document.getElementById(localStorage.getItem("tool")+" tool").style.backgroundColor = "#ffa500";
    document.getElementById(localStorage.getItem("tool")+" tool").style.borderRadius = "0.1rem";
}

function getMousePosition(event) {
    var bounds = c.getBoundingClientRect();

    var scaleX = c.width / bounds.width;
    var scaleY = c.height / bounds.height;

    var x = Math.floor((event.clientX - bounds.left) * scaleX / 64);
    var y = Math.floor((event.clientY - bounds.top) * scaleY / 64);

    if (x == -1) {
        x = 0;
    }

    if (y == -1) {
        y = 0;
    }

    return { x, y };
}

var oldX;
var oldY;

function downCoords(event) {
    mouseDown = true;

    canvas.setPointerCapture(1);

    document.getElementsByClassName("layout")[0].style.pointerEvents = "none";
    document.getElementsByClassName("layout")[0].style.opacity = "50%";
    document.getElementsByClassName("layout")[0].style.zIndex = 2;
    document.getElementsByClassName("layout")[0].style.position = "fixed";
    
    var { x, y } = getMousePosition(event);

    oldX = Math.ceil(x*64)+32;
    oldY = Math.ceil(y*64)+32;

    if (mapData[y] == undefined && mapData[y][x] == undefined) {
        c.style.cursor = "url(img/cursors/Select-32.png), auto";
    }

    if (mouseDown) {
        if (mapData[y] != undefined && mapData[y][x] != undefined) {
            if (tool == "pen") {
                c.style.cursor = "url(img/cursors/PaintDown-32.png), auto";

                if (mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                    mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;
                    drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                }
            } else if (tool == "eraser") {
                c.style.cursor = "url(img/cursors/EraserDown-32.png), auto";

                if (mapData[y][x] != 0) {
                    mapData[y][x] = 0;
                    drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                }
            } else if (tool == "select") {
                c.style.cursor = "url(img/cursors/Select-32.png), auto";

                selectRange[0] = x;
                selectRange[1] = y;
                selectRange.length = 2;

                filex.value = x;
                filey.value = y;
                filew.value = 1;
                fileh.value = 1;
                downloadButton.innerText = "Download Selected";

                drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
            }
        }
    }
}

function getPixelsOnLine(startX, startY, endX, endY){
    const pixelCols = [];
    const getPixel = (x,y) => {
        x = Math.floor(x / 64);
        y = Math.floor(y / 64);
        return { x, y };
    }

    var x = Math.floor(startX);
    var y = Math.floor(startY);
    const xx = Math.floor(endX);
    const yy = Math.floor(endY);
    const dx = Math.abs(xx - x); 
    const sx = x < xx ? 1 : -1;
    const dy = -Math.abs(yy - y);
    const sy = y < yy ? 1 : -1;
    var err = dx + dy;
    var e2;
    var end = false;
    while (!end) {
        pixelCols.push(getPixel(x,y));
        if ((x === xx && y === yy)) {
            end = true;
        } else {
            e2 = 2 * err;
            if (e2 >= dy) {
                err += dy;
                x += sx;
            }
            if (e2 <= dx) {
                err += dx;
                y += sy;
            }
        }
    }
    return pixelCols;
}

function deletePixels(pixels) {
    for (let i2 = 0; i2 < pixels.length-1; i2++) {
        for (let i = 0; i < pixels.length-1; i++) {
            if (pixels[i].x == pixels[i2].x && pixels[i].y == pixels[i2].y) {
                pixels.splice(i, 1);
            }
        }
    }
}

function moveCoords(event) {
    if (event.getCoalescedEvents) {
        var { x, y } = getMousePosition(event);

            if (mapData[y] == undefined && mapData[y][x] == undefined) {
                c.style.cursor = "url(img/cursors/Select-32.png), auto";
            }

            if (rightMouseDown) {
                if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                    if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                        if (tool == "pen") {
                            c.style.cursor = "url(img/cursors/EraserDown-32.png), auto";

                            if (selectRange.length != 0) {
                                selectRange.length = 0;
                            }

                            if (mapData[y][x] != 0) {
                                if (oldX == null && oldY == null) {
                                    if ( mapData[y][x] != 0) {
                                        mapData[y][x] = 0;
                                        oldX = Math.ceil(x*64)+32;
                                        oldY = Math.ceil(y*64)+32;
                                    }
                                } else {
                                    var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*64)+32,Math.ceil(y*64)+32);
                                    deletePixels(pixels);
                                    for (let i = 0; i < pixels.length; i++) {
                                        if ( mapData[pixels[i].y][pixels[i].x] != 0) {
                                            mapData[pixels[i].y][pixels[i].x] = 0;
                                            oldX = Math.ceil(x*64)+32;
                                            oldY = Math.ceil(y*64)+32;
                                        }
                                    }
                                }
        
                                drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                            } else {
                                oldX = null;
                                oldY = null;
                            }
                        } else if (tool == "eraser") {
                            c.style.cursor = "url(img/cursors/PaintDown-32.png), auto";

                            if (selectRange.length != 0) {
                                selectRange.length = 0;
                            }

                            if (mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                if (oldX == null && oldY == null) {
                                    if ( mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                        mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                        oldX = Math.ceil(x*64)+32;
                                        oldY = Math.ceil(y*64)+32;
                                    }
                                } else {
                                    var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*64)+32,Math.ceil(y*64)+32);
                                    deletePixels(pixels);
                                    for (let i = 0; i < pixels.length; i++) {
                                        if ( mapData[pixels[i].y][pixels[i].x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                            mapData[pixels[i].y][pixels[i].x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                            oldX = Math.ceil(x*64)+32;
                                            oldY = Math.ceil(y*64)+32;
                                        }
                                    }
                                }
        
                                drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                            } else {
                                oldX = null;
                                oldY = null;
                            }
                        }
                    }
                }
            } else if (mouseDown) {
                if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                    if (tool == "pen") {
                        c.style.cursor = "url(img/cursors/PaintDown-32.png), auto";

                        if (selectRange.length != 0) {
                            selectRange.length = 0;
                        }

                        if (mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                            if (oldX == null && oldY == null) {
                                if ( mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                    mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                    oldX = Math.ceil(x*64)+32;
                                    oldY = Math.ceil(y*64)+32;
                                }
                            } else {
                                var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*64)+32,Math.ceil(y*64)+32);
                                deletePixels(pixels);
                                for (let i = 0; i < pixels.length; i++) {
                                    if ( mapData[pixels[i].y][pixels[i].x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                        mapData[pixels[i].y][pixels[i].x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                        oldX = Math.ceil(x*64)+32;
                                        oldY = Math.ceil(y*64)+32;
                                    }
                                }
                            }

                            drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                        } else {
                            oldX = null;
                            oldY = null;
                        }
                    } else if (tool == "eraser") {
                        c.style.cursor = "url(img/cursors/EraserDown-32.png), auto";

                        if (selectRange.length != 0) {
                            selectRange.length = 0;
                        }

                        if (mapData[y][x] != 0) {
                            if (oldX == null && oldY == null) {
                                if ( mapData[y][x] != 0) {
                                    mapData[y][x] = 0;
                                    oldX = Math.ceil(x*64)+32;
                                    oldY = Math.ceil(y*64)+32;
                                }
                            } else {
                                var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*64)+32,Math.ceil(y*64)+32);
                                deletePixels(pixels);
                                for (let i = 0; i < pixels.length; i++) {
                                    if ( mapData[pixels[i].y][pixels[i].x] != 0) {
                                        mapData[pixels[i].y][pixels[i].x] = 0;
                                        oldX = Math.ceil(x*64)+32;
                                        oldY = Math.ceil(y*64)+32;
                                    }
                                }
                            }

                            drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                        } else {
                            oldX = null;
                            oldY = null;
                        }
                    } else if (tool == "select") {
                        c.style.cursor = "url(img/cursors/Select-32.png), auto";

                        selectRange[2] = x;
                        selectRange[3] = y;
                        
                        if (selectRange[0]<=selectRange[2]&&selectRange[1]<=selectRange[3]) {
                            filew.value = selectRange[2] - selectRange[0] + 1;
                            fileh.value = selectRange[3] - selectRange[1] + 1;
                        } else {
                            filex.value = selectRange[2];
                            filey.value = selectRange[3];
                            filew.value = selectRange[0] - selectRange[2] + 1;
                            fileh.value = selectRange[1] - selectRange[3] + 1;
                        }

                        drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                    }
                }
            } else {
                if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                    if (tool == "pen") {
                        c.style.cursor = "url(img/cursors/Paint-32.png), auto";
                    } else if (tool == "eraser") {
                        c.style.cursor = "url(img/cursors/Eraser-32.png), auto";
                    } else if (tool == "select") {
                        c.style.cursor = "url(img/cursors/Select-32.png), auto";
                    }
                }
            }
    } else {
        var { x, y } = getMousePosition(event);

        if (mapData[y] == undefined && mapData[y][x] == undefined) {
            c.style.cursor = "url(img/cursors/Select-32.png), auto";
        }

        if (rightMouseDown) {
            if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                    if (tool == "pen") {
                        c.style.cursor = "url(img/cursors/EraserDown-32.png), auto";

                        if (selectRange.length != 0) {
                            selectRange.length = 0;
                        }

                        if (mapData[y][x] != 0) {
                            if (oldX == null && oldY == null) {
                                if ( mapData[y][x] != 0) {
                                    mapData[y][x] = 0;
                                    oldX = Math.ceil(x*64)+32;
                                    oldY = Math.ceil(y*64)+32;
                                }
                            } else {
                                var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*64)+32,Math.ceil(y*64)+32);
                                deletePixels(pixels);
                                for (let i = 0; i < pixels.length; i++) {
                                    if ( mapData[pixels[i].y][pixels[i].x] != 0) {
                                        mapData[pixels[i].y][pixels[i].x] = 0;
                                        oldX = Math.ceil(x*64)+32;
                                        oldY = Math.ceil(y*64)+32;
                                    }
                                }
                            }
    
                            drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                        } else {
                            oldX = null;
                            oldY = null;
                        }
                    } else if (tool == "eraser") {
                        c.style.cursor = "url(img/cursors/PaintDown-32.png), auto";

                        if (selectRange.length != 0) {
                            selectRange.length = 0;
                        }

                        if (mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                            if (oldX == null && oldY == null) {
                                if ( mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                    mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                    oldX = Math.ceil(x*64)+32;
                                    oldY = Math.ceil(y*64)+32;
                                }
                            } else {
                                var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*64)+32,Math.ceil(y*64)+32);
                                deletePixels(pixels);
                                for (let i = 0; i < pixels.length; i++) {
                                    if ( mapData[pixels[i].y][pixels[i].x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                        mapData[pixels[i].y][pixels[i].x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                        oldX = Math.ceil(x*64)+32;
                                        oldY = Math.ceil(y*64)+32;
                                    }
                                }
                            }
    
                            drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                        } else {
                            oldX = null;
                            oldY = null;
                        }
                    }
                }
            }
        } else if (mouseDown) {
            if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                if (tool == "pen") {
                    c.style.cursor = "url(img/cursors/PaintDown-32.png), auto";

                    if (selectRange.length != 0) {
                        selectRange.length = 0;
                    }

                    if (mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                        if (oldX == null && oldY == null) {
                            if ( mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                oldX = Math.ceil(x*64)+32;
                                oldY = Math.ceil(y*64)+32;
                            }
                        } else {
                            var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*64)+32,Math.ceil(y*64)+32);
                            deletePixels(pixels);
                            for (let i = 0; i < pixels.length; i++) {
                                if ( mapData[pixels[i].y][pixels[i].x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                                    mapData[pixels[i].y][pixels[i].x] = TILE_TYPES[TILE_TYPES.length-1].id;
                                    oldX = Math.ceil(x*64)+32;
                                    oldY = Math.ceil(y*64)+32;
                                }
                            }
                        }

                        drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                    } else {
                        oldX = null;
                        oldY = null;
                    }
                } else if (tool == "eraser") {
                    c.style.cursor = "url(img/cursors/EraserDown-32.png), auto";

                    if (selectRange.length != 0) {
                        selectRange.length = 0;
                    }

                    if (mapData[y][x] != 0) {
                        if (oldX == null && oldY == null) {
                            if ( mapData[y][x] != 0) {
                                mapData[y][x] = 0;
                                oldX = Math.ceil(x*64)+32;
                                oldY = Math.ceil(y*64)+32;
                            }
                        } else {
                            var pixels = getPixelsOnLine(oldX,oldY,Math.ceil(x*64)+32,Math.ceil(y*64)+32);
                            deletePixels(pixels);
                            for (let i = 0; i < pixels.length; i++) {
                                if ( mapData[pixels[i].y][pixels[i].x] != 0) {
                                    mapData[pixels[i].y][pixels[i].x] = 0;
                                    oldX = Math.ceil(x*64)+32;
                                    oldY = Math.ceil(y*64)+32;
                                }
                            }
                        }

                        drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                    } else {
                        oldX = null;
                        oldY = null;
                    }
                } else if (tool == "select") {
                    c.style.cursor = "url(img/cursors/Select-32.png), auto";

                    selectRange[2] = x;
                    selectRange[3] = y;
                    
                    if (selectRange[0]<=selectRange[2]&&selectRange[1]<=selectRange[3]) {
                        filew.value = selectRange[2] - selectRange[0] + 1;
                        fileh.value = selectRange[3] - selectRange[1] + 1;
                    } else {
                        filex.value = selectRange[2];
                        filey.value = selectRange[3];
                        filew.value = selectRange[0] - selectRange[2] + 1;
                        fileh.value = selectRange[1] - selectRange[3] + 1;
                    }

                    drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                }
            }
        } else {
            if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
                if (tool == "pen") {
                    c.style.cursor = "url(img/cursors/Paint-32.png), auto";
                } else if (tool == "eraser") {
                    c.style.cursor = "url(img/cursors/Eraser-32.png), auto";
                } else if (tool == "select") {
                    c.style.cursor = "url(img/cursors/Select-32.png), auto";
                }
            }
        }
    }
}

function upCoords(event) {
    canvas.releasePointerCapture(1);

    document.getElementsByClassName("layout")[0].style.pointerEvents = "auto";
    document.getElementsByClassName("layout")[0].style.position = "";
    document.getElementsByClassName("layout")[0].style.opacity = "100%";
    document.getElementsByClassName("layout")[0].style.zIndex = "";

    mouseDown = false;
    rightMouseDown = false;

    var { x, y } = getMousePosition(event);

    if (mapData[y] == undefined && mapData[y][x] == undefined) {
        c.style.cursor = "url(img/cursors/Select-32.png), auto";
    }

    if (tool == "pen") {
        c.style.cursor = "url(img/cursors/Paint-32.png), auto";
    } else if (tool == "eraser") {
        c.style.cursor = "url(img/cursors/Eraser-32.png), auto";
    } else if (tool == "select") {
        c.style.cursor = "url(img/cursors/Select-32.png), auto";
    }

    saveTilemap();
}

function scrollCoords(event) {
    if (event.srcElement == canvas) {
        document.getElementById("scroll-container").scrollLeft -= event.deltaX;
        document.getElementById("scroll-container").scrollTop -= event.deltaY;
    }

    drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
}

function resetTiles() {
    if (confirm("Hold up! Are you sure you want to reset?\nAll progress will be lost unless saved as a .cstiles file.") == true) {
        TILE_TYPES = [
            { id: 1, colour: '#ffffff' },
        ]

        mapData = [];
        for (let i = 0; i < Math.ceil(c.height/64); i++) {
            mapData[i] = [];
            for (let i2 = 0; i2 < Math.ceil(c.width/64); i2++) {
                mapData[i][i2] = 0;
            }
        }

        saveTilemap();

        tileColour.value = TILE_TYPES[TILE_TYPES.length-1].colour;
        document.getElementById('outlineCheck').checked = false;
        tileOutline.classList.add('disabled');
        tileOutline.setAttribute('disabled', '');
        tileOpacity.value = 100;
        tileShape.value = "square";

        drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
    }
}

function deleteTileTypes() {
    for (let i = 0; i < mapData.length-1; i++) {
        for (let i = 0; i < TILE_TYPES.length-1; i++) {
            if (!JSON.stringify(mapData).includes(TILE_TYPES[i].id)) {
                TILE_TYPES.splice(i, 1);
            }
        }
    }

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

function comingSoon(event){if(event.srcElement.classList.contains('button')&&!event.srcElement.classList.contains('disabled')){alert('Haha. Very funny. Sorry, but enabling the button isn\'t going to get you anywhere...')};}

function importFile(event) {
    var file = event.srcElement.files[0];
    const reader = new FileReader();

    reader.addEventListener("load",() => {
        TILE_TYPES = JSON.parse(reader.result.split('~')[0]);
        mapData = JSON.parse(reader.result.split('~')[1]);
        saveTilemap();

        drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
    },false);

    if (file) {
        reader.readAsText(file);
    }
}

function exportTilemap(type,x,y,w,h) {
    x *= 1;
    y *= 1;
    w *= 64;
    h *= 64;

    if (type == undefined) {
        ctx = c.getContext("2d");
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        ctx.clearRect(0,0,c.width,c.height);
    } else if (type == "svg") {
        ctx = new C2S(w,h);
    } else {
        ctx = c.getContext("2d");
        c.width = w-x;
        c.height = h-y;
        ctx.clearRect(0,0,c.width,c.height);
    }

    for (let yh = 0; yh < mapData.length-y; yh++) {
        for (let xw = 0; xw < mapData[0].length-x; xw++) {
            drawTile(xw+x,yh+y,-x,-y);
        }
    }

    if (type == "svg") {
        var svg = ctx.getSvg();

        if (window.ActiveXObject) {
            svgString = svg.xml;
        } else {
            var oSerializer = new XMLSerializer();
            svgString = oSerializer.serializeToString(svg);
        }

        var dl = document.createElement("a");
        dl.download = document.getElementById("filename").value;
        dl.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
        dl.click();
        delete dl;

        ctx = c.getContext("2d");
    } else if (type != undefined && type != "cstiles") {
        var dl = document.createElement("a");
        dl.download = document.getElementById("filename").value;
        dl.href = c.toDataURL("image/"+type);
        dl.click();
        delete dl;
        c.height = window.innerHeight;
        c.width = window.innerWidth;
        drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
    }

    if (type == "cstiles") {
        var dl = document.createElement("a");
        dl.download = document.getElementById("filename").value+".cstiles";
        dl.href = "data:text/plain;utf-8,"+encodeURIComponent(JSON.stringify(TILE_TYPES)+"~"+JSON.stringify(mapData));
        dl.click();
        delete dl;
        c.height = window.innerHeight;
        c.width = window.innerWidth;
        drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
    }
}

c.addEventListener('contextmenu', function(event) {
    rightMouseDown = true;

    var { x, y } = getMousePosition(event);

    if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
        if (mapData[y] !== undefined && mapData[y][x] !== undefined) {
            if (tool == "pen") {
                c.style.cursor = "url(img/cursors/EraserDown-32.png), auto";

                if (mapData[y][x] != 0) {
                    mapData[y][x] = 0;
                    drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                }
            } else if (tool == "eraser") {
                c.style.cursor = "url(img/cursors/PaintDown-32.png), auto";

                if (mapData[y][x] != TILE_TYPES[TILE_TYPES.length-1].id) {
                    mapData[y][x] = TILE_TYPES[TILE_TYPES.length-1].id;
                    drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
    );
                }
            } else if (tool == "select") {
                c.style.cursor = "url(img/cursors/Select-32.png), auto";
            }
        }
    }
});

c.addEventListener('pointerdown', downCoords);
c.addEventListener('wheel', scrollCoords, {passive: true});
c.addEventListener('pointermove', moveCoords);
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

drawLayer(
        Math.ceil(canvas.width/64)*(document.getElementById("scroll-container").scrollLeft/document.getElementById("scroll-container").clientWidth),
        Math.ceil(canvas.height/64)*(document.getElementById("scroll-container").scrollTop/document.getElementById("scroll-container").clientHeight),
        Math.ceil(canvas.width/64),Math.ceil(canvas.height/64),true,true
);

var date = new Date()
document.getElementById("nav-info").innerText = date.toLocaleString('default', { date: '' });

function getTime() {
    date = new Date();
    document.getElementById("nav-info").innerText = date.toLocaleString('default', { date: '' });
}

window.setInterval(getTime, 1000);