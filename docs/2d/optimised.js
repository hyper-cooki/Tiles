if (localStorage.tiletypes) {
    TILE_TYPES = JSON.parse(localStorage.getItem("tiletypes"))
} else {
    TILE_TYPES = [
        { id: 0, colour: 'rgba(0,0,0,0)' },
        { id: 1, colour: 'rgba(100,100,100,1)' },
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
    
    if (type == undefined) {
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
        mapData[y-1][x-1] = 1;
    } else if (document.getElementById("tool").value == "eraser") {
        mapData[y-1][x-1] = 0;
    }
    drawLayer(0,0);
}

var mouseDown = false;

const ui = document.getElementById("ui");

ui.style.left = "0px";
ui.style.height = window.innerHeight+"px";

function toggleUI() {
    ui.classList.toggle("showUI");
}

function downCoords(event) {
    mouseDown = true;

    let x = Math.ceil(event.clientX/64);
    let y = Math.ceil(event.clientY/64);

    changeTile(x,y);
    drawLayer(0,0);

    ui.classList.add("disabled");

    localStorage.setItem("tilemap", JSON.stringify(mapData));
    localStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));
}

function moveCoords(event) {
    if (mouseDown) {
        let x = Math.ceil(event.clientX/64);
        let y = Math.ceil(event.clientY/64);

        changeTile(x,y);
        drawLayer(0,0);

        ui.classList.add("disabled");

        localStorage.setItem("tilemap", JSON.stringify(mapData));
        localStorage.setItem("tiletypes", JSON.stringify(TILE_TYPES));
    }
}

function stopCoords() {
    mouseDown = false

    ui.classList.remove("disabled");

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
        location.reload();
        drawLayer(0,0);

        for (let i = 0; i < Math.ceil(window.innerWidth/64); i++) {
            for (let i2 = 0; i2 < Math.ceil(window.innerHeight/64); i2++) {
                mapData[i][i2] = 0;
                document.getElementById("orthogonal-map").height = document.getElementById("tileSize").value * mapData.length;
                document.getElementById("orthogonal-map").width = document.getElementById("tileSize").value * mapData[0].length;
            }
        }

        TILE_TYPES = [
            { id: 0, colour: 'rgba(0,0,0,0)' },
            { id: 1, colour: 'rgba(100,100,100,1)' },
        ]

        localStorage.setItem("tiletypes",TILE_TYPES);
        localStorage.setItem("tilemap",mapData);
    }
}