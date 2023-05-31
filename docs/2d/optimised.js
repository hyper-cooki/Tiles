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
        if (TILE_TYPES[i].id == mapData[y][x]) {
          var tileType = TILE_TYPES[i];
        }
    }

    x *= 64;
    y *= 64;

    if (tileType.shape == "square" || tileType.shape == undefined) {
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
        ctx.translate(x+0.5*(x+64), y+0.5*(y+64)); //translate to center of shape
        ctx.rotate((Math.PI / 180) * 25); //rotate 25 degrees.
        ctx.translate(-(x+0.5*(x+64)), -(y+0.5*(y+64))); 
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
    if (type == undefined) {
        ctx = c.getContext("2d");
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        ctx.clearRect(0,0,c.width,c.height);
    } else if (type == "svg") {
        ctx = new C2S(Number(document.getElementById("saveW").value)*64,Number(document.getElementById("saveH").value)*64);
    } else {
        ctx = c.getContext("2d");
        c.width = Number(document.getElementById("saveW").value)*64;
        c.height = Number(document.getElementById("saveH").value)*64;
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
    } else if (type != undefined && type != "cstiles") {
        var dl = document.createElement("a");
        dl.download = document.getElementById("filename").value;
        dl.href = c.toDataURL("image/"+type);
        dl.click();
        delete dl;
        drawLayer(0,0);
    }

    if (type == "cstiles") {
        var dl = document.createElement("a");
        dl.download = document.getElementById("filename").value+".cstiles";
        dl.href = "data:text/plain;utf-8,"+encodeURIComponent(JSON.stringify(TILE_TYPES)+"<"+JSON.stringify(mapData)+">");
        dl.click();
        delete dl;
        drawLayer(0,0);
    }
}

drawLayer(0,0);

function exportImg() {
    drawLayer(Number(document.getElementById("saveX").value),Number(document.getElementById("saveY").value),document.getElementById("filext").value);
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
let temp = TILE_TYPES[TILE_TYPES.length-1].colour;
temp.slice(0, temp.length-2).toString();
tileColour.value = temp;
delete temp

const tileShape = document.getElementById("shape");

const tileOpacity = document.getElementById("opacity");
if (TILE_TYPES[TILE_TYPES.length-1].opacity == undefined) {
    tileOpacity.value = 100;
} else {
    tileOpacity.value = TILE_TYPES[TILE_TYPES.length-1].opacity
}

const tileRotation = document.getElementById("tileRotation");
if (TILE_TYPES[TILE_TYPES.length-1].rotation == undefined) {
    tileRotation.value = 0;
} else {
    tileRotation.value = JSON.parse(TILE_TYPES[TILE_TYPES.length-1].rotation);
}

function addTypes(t) {
    if (tileShape.value == 'square') {
        if (tileOpacity.value < 1) {
            TILE_TYPES[t] = { id: t, colour: tileColour.value+(tileOpacity.value*100), rotation: tileRotation.value };
        } else {
            TILE_TYPES[t] = { id: t, colour: tileColour.value, rotation: tileRotation.value };
        }
    } else {
        if (tileOpacity.value < 1) {
            TILE_TYPES[t] = { id: t, colour: tileColour.value+(tileOpacity.value*100), shape: tileShape.value, rotation: tileRotation.value };
        } else {
            TILE_TYPES[t] = { id: t, colour: tileColour.value, shape: tileShape.value, rotation: tileRotation.value };
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
        for (let i = 0; i < Math.ceil(window.innerHeight/64); i++) {
            mapData[i] = [];
            for (let i2 = 0; i2 < Math.ceil(window.innerWidth/64); i2++) {
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

        if (TILE_TYPES[TILE_TYPES.length-1].opacity == undefined) {
            tileOpacity.value = 100;
        } else {
            tileOpacity.value = TILE_TYPES[TILE_TYPES.length-1].opacity
        }

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
        delete TILE_TYPES;
        TILE_TYPES = JSON.parse(reader.result.substring(0, reader.result.indexOf("<")));
        delete mapData;
        mapData = JSON.parse(reader.result.substring(reader.result.indexOf("<")+1, reader.result.indexOf(">")));
        
        localStorage.setItem("tilemap", JSON.stringify(mapData));
        localStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));

        tileColour.value = TILE_TYPES[TILE_TYPES.length-1].colour
        
        drawLayer(0,0);
    };
    reader.readAsText(input.files[0]);
};