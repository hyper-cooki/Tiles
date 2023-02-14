if (localStorage.tiletypes) {
    TILE_TYPES = JSON.parse(localStorage.getItem("tiletypes"))
} else {
    TILE_TYPES = [
        { id: 0, colour: '#00000000' },
        { id: 1, colour: '#ffffff' },
    ]
}

if (localStorage.tilemap) {
    mapData = JSON.parse(localStorage.getItem("tilemap"))
} else {
    mapData = [
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
}

const c = document.createElement("canvas");

c.height = window.innerHeight;
c.width = window.innerWidth;
c.setAttribute("id", "canvas");
document.body.appendChild(c);
c.style.cursor = "pointer";

function drawTile(x,y,type) {
    for (let i = 0; i < TILE_TYPES.length; i++) {
        if (i == mapData[y][x]) {
          var tileType = TILE_TYPES[i];
        }
    }

    x *= 64;
    y *= 64;

    if (tileType.shape == "square" || tileType.shape == undefined) {
        console.log(tileType.shape);
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x+64,y);
        ctx.lineTo(x+64,y+64);
        ctx.lineTo(x,y+64);
        ctx.closePath();
    } else if (tileType.shape == "triangle") {
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x+64,y+64);
        ctx.lineTo(x,y+64);
        ctx.closePath();
    } else if (tileType.shape == "thin-triangle") {
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x+32,y+64);
        ctx.lineTo(x,y+64);
        ctx.closePath();
    } else if (tileType.shape == "curve") {
        ctx.beginPath();
        ctx.arc(x,y+64,64,1.5*Math.PI,0);
        ctx.lineTo(x,y+64);
        ctx.closePath();
    } else if (tileType.shape == "reverse-curve") {
        ctx.beginPath();
        ctx.arc(x+64,y,64,2.5*Math.PI,Math.PI);
        ctx.lineTo(x,y+64);
        ctx.closePath();
    }

    if (tileType.id != 0) {
        ctx.fillStyle = tileType.colour;
        ctx.fill();
        
    }
    
    if (type == undefined) {
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x+64,y)
        ctx.lineTo(x+64,y+64);
        ctx.lineTo(x,y+64);
        ctx.closePath();
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = "2";
        ctx.stroke();
    }
}

function drawLayer(x,y,type) {
    if (type == "svg") {
        ctx = new C2S(window.innerWidth,window.innerHeight);
    } else {
        ctx = c.getContext("2d");
        ctx.clearRect(0,0,c.width,c.height);
    }

    for (let yh = 0; yh < mapData.length-y; yh++) {
        for (let xw = 0; xw < mapData[0].length-x; xw++) {
            drawTile(xw+x,yh+y,type);
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
    } else if (type != undefined) {
        var dl = document.createElement("a");
        dl.download = document.getElementById("filename").value;
        dl.href = c.toDataURL("image/"+type);
        dl.click();
        delete dl;
        drawLayer(0,0);
    }
}

drawLayer(0,0);

function exportImg() {
    drawLayer(0,0,document.getElementById("filext").value);
}

function changeTile(x,y) {
    if (document.getElementById("tool").value == "pen") {
        mapData[y-1][x-1] = TILE_TYPES[TILE_TYPES.length-1].id;
    } else if (document.getElementById("tool").value == "eraser") {
        mapData[y-1][x-1] = 0;
    }
    drawLayer(0,0);
}

const tileColour = document.getElementById("tileColour");
tileColour.value = TILE_TYPES[TILE_TYPES.length-1].colour;

const tileShape = document.getElementById("shape");

const tileOpacity = document.getElementById("opacity");

function addTypes(t) {
    if (tileShape.value == 'square') {
        if (tileOpacity.value < 1) {
            TILE_TYPES[t] = { id: t, colour: tileColour.value+(tileOpacity.value*100) };
        } else {
            TILE_TYPES[t] = { id: t, colour: tileColour.value };
        }
    } else {
        if (tileOpacity.value < 1) {
            TILE_TYPES[t] = { id: t, colour: tileColour.value+(tileOpacity.value*100), shape: tileShape.value };
        } else {
            TILE_TYPES[t] = { id: t, colour: tileColour.value, shape: tileShape.value };
        }
    }
}

var mouseDown = false;

const ui = document.getElementById("ui");

ui.style.left = "0px";
ui.style.height = window.innerHeight+"px";

function toggleUI() {
    ui.classList.toggle("showUI");
}

function downCoords(event) {
    c.style.cursor = "crosshair";

    mouseDown = true;

    let x = Math.ceil(event.clientX/64);
    let y = Math.ceil(event.clientY/64);

    changeTile(x,y);
    drawLayer(0,0);

    ui.classList.add("disabled");
    document.getElementById("uiToggle").classList.add("disabled");

    localStorage.setItem("tilemap", JSON.stringify(mapData));
    localStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));
}

function moveCoords(event) {
    if (mouseDown) {
        c.style.cursor = "crosshair";

        let x = Math.ceil(event.clientX/64);
        let y = Math.ceil(event.clientY/64);

        changeTile(x,y);
        drawLayer(0,0);

        ui.classList.add("disabled");
        document.getElementById("uiToggle").classList.add("disabled");

        localStorage.setItem("tilemap", JSON.stringify(mapData));
        localStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));
    }
}

function stopCoords() {
    c.style.cursor = "pointer";

    mouseDown = false

    ui.classList.remove("disabled");
    document.getElementById("uiToggle").classList.remove("disabled");

    localStorage.setItem("tilemap", JSON.stringify(mapData));
    localStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));
}

c.setAttribute("onpointermove","moveCoords(event)");
c.setAttribute("onpointerdown","downCoords(event)");
c.setAttribute("onpointerup","stopCoords()");
c.setAttribute("onpointerleave","stopCoords()");
c.setAttribute("oncontextmenu","stopCoords()");

function deleteAll() {
    if (window.confirm("Are you sure?\nAll of your progress saved on this tilemap will be removed.")) {
        localStorage.clear();


        mapData = [];
        for (let i = 0; i < document.getElementById("gridY").value; i++) {
            mapData[i] = [];
            for (let i2 = 0; i2 < document.getElementById("gridX").value; i2++) {
                mapData[i][i2] = 0;
            }
        }

        TILE_TYPES = [
            { id: 0, colour: '#00000000' },
            { id: 1, colour: '#ffffff' },
        ]

        localStorage.setItem("tilemap", JSON.stringify(mapData));
        localStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));

        tileColour.value = TILE_TYPES[TILE_TYPES.length-1].colour;

        drawLayer(0,0);
    }
}

function deleteTileTypes() {
        for (let i = 0; i < TILE_TYPES[TILE_TYPES.length-1].id; i++) {
            if (!(mapData.toString().includes(TILE_TYPES[i].id))) {   
                TILE_TYPES.splice(i, 1);
            } else {
                i++;
            }
        }
}

function openFile(event) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function() {
        delete mapData;
        mapData = JSON.parse(reader.result.substring(reader.result.indexOf("<")+1, reader.result.indexOf(">")));
        delete TILE_TYPES;
        TILE_TYPES = JSON.parse(reader.result.substring(0, reader.result.indexOf("<")));
        
        localStorage.setItem("tilemap", JSON.stringify(mapData));
        localStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));

        tileColour.value = TILE_TYPES[TILE_TYPES.length-1].colour
        
        drawLayer(0,0);
    };
    reader.readAsText(input.files[0]);
};