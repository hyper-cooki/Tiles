TILE_TYPES = [
    { id: 0, colour: 'rgba(0,0,0,0)' },
    { id: 1, colour: 'rgba(255,255,255,1)' },
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

const p = document.createElement("p");

document.body.appendChild(p);
p.setAttribute("style", "margin: 0; background: rgba(0,0,0,1); padding:0; border-radius: 1em; position: absolute; top: 10%; left: 50%; margin-right: -50%; transform: translate(-50%, -50%); ")

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

var mouseDown = false;

function downCoords(touch) {
    mouseDown = true;

    p.setAttribute("style", "margin: 0; background: rgba(0,0,0,1); padding:1em; border-radius: 1em; position: absolute; top: 10%; left: 50%; margin-right: -50%; transform: translate(-50%, -50%); ")

    let x = Math.ceil(touch.clientX);
    let y = Math.ceil(touch.clientY);

    let text = x + ", " + y;
    p.innerHTML = text;
}

function showCoords(touch) {
    if (mouseDown) {
        p.setAttribute("style", "margin: 0; background: rgba(0,0,0,1); padding:1em; border-radius: 1em; position: absolute; top: 10%; left: 50%; margin-right: -50%; transform: translate(-50%, -50%); ")

        let x = Math.ceil(touch.clientX);
        let y = Math.ceil(touch.clientY);

        let text = x + ", " + y;
        p.innerHTML = text;
    }
}

function hideCoords() {
    mouseDown = false
    p.innerHTML = "";
    p.setAttribute("style", "margin: 0; background: rgba(0,0,0,1); padding:0; border-radius: 1em; position: absolute; top: 10%; left: 50%; margin-right: -50%; transform: tran")
}

c.setAttribute("onpointermove","showCoords(event)");
c.setAttribute("onpointerdown","downCoords(event)");
c.setAttribute("onpointerup","hideCoords()");
c.setAttribute("onpointerleave","hideCoords()");
c.setAttribute("oncontextmenu","hideCoords()");