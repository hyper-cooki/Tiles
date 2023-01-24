TILE_TYPES = [
    { id: 0, colour: 'rgba(0,0,0,0)' },
    { id: 1, colour: 'rgba(100,100,100,1)' },
]

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

const c = document.createElement("canvas");

c.height = window.innerHeight;
c.width = window.innerWidth;
c.setAttribute("id", "canvas");
document.body.appendChild(c);

function drawTile(x,y,type) {
    for (let i = 0; i < TILE_TYPES[TILE_TYPES.length-1].id+1; i++) {
        if (i == mapData[y][x]) {
          var tileType = TILE_TYPES[i];
        }
    }

    if (tileType != 0) {
        ctx.beginPath();
        ctx.fillStyle = tileType.colour;
        ctx.moveTo(x*64,y*64);
        ctx.lineTo(x*64+64,y*64)
        ctx.lineTo(x*64+64,y*64+64);
        ctx.lineTo(x*64,y*64+64);
        ctx.lineTo(x*64,y*64);
        ctx.fill();
    }
    
    if (type != "svg") {
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = "2";
        ctx.stroke();
    }
}

function drawLayer(x,y,type) {
    if (type == "svg") {
        ctx = new C2S(mapData.length*64,mapData[0].length*64);
    } else {
        ctx = c.getContext("2d");
    }

    ctx.clearRect(0,0,c.width,c.height);
    ctx.clearRect(0, 0, 800, 400);

    for (let yh = 0; yh < mapData.length-y; yh++) {
        for (let xw = 0; xw < mapData[0].length-x; xw++) {
            drawTile(xw+x,yh+y,type);
        }
    }

    if (type == "svg") {
        var dl = document.createElement("a");
        document.body.appendChild(dl);
        var svg = ctx.getSvg();

        if (window.ActiveXObject) {
            svgString = svg.xml;
        } else {
            var oSerializer = new XMLSerializer();
            svgString = oSerializer.serializeToString(svg);
        }

        dl.download = "Tilemap.svg";
        dl.href='data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
        dl.click();
    }
}

drawLayer(0,0);

function changeTile(x,y) {
    mapData[y-1][x-1] = 1;
    drawLayer(0,0);
}

var mouseDown = false;

const ui = document.getElementById("ui");

function downCoords(event) {
    mouseDown = true;

    let x = Math.ceil(event.clientX/64);
    let y = Math.ceil(event.clientY/64);

    changeTile(x,y);
    drawLayer(0,0);

    ui.classList.add("disabled");
}

function moveCoords(event) {
    if (mouseDown) {
        let x = Math.ceil(event.clientX/64);
        let y = Math.ceil(event.clientY/64);

        changeTile(x,y);
        drawLayer(0,0);

        ui.classList.add("disabled");
    }
}

function stopCoords() {
    mouseDown = false

    ui.classList.remove("disabled");
}

c.setAttribute("onpointermove","moveCoords(event)");
c.setAttribute("onpointerdown","downCoords(event)");
c.setAttribute("onpointerup","stopCoords()");
c.setAttribute("onpointerleave","stopCoords()");
c.setAttribute("oncontextmenu","stopCoords()");