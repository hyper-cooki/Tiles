const c = document.createElement("canvas");
c.id = "canvas";
c.width = window.innerWidth;
c.height = window.innerHeight;
document.body.appendChild(c);

const ctx = c.getContext("2d");
let offsetX = 0;
let offsetY = 0;

function drawGrid() {
    gridScale = scale * 64;
    window.localStorage.setItem("gridScale", gridScale);

    c.width = window.innerWidth;
    c.height = window.innerHeight;

    ctx.strokeStyle = "grey";
    ctx.globalAlpha = 1;

    for (let y = 0; y < Math.ceil(c.height/gridScale); y += 1) {
        for (let x = 0; x < Math.ceil(c.width/gridScale); x += 1) {
            ctx.strokeRect(x*gridScale + offsetX*gridScale,y*gridScale + offsetY*gridScale,gridScale,gridScale);
        }
    }
}

function zoom(event) {
    scale += event.deltaY * -0.01;

    // Restrict scale
    scale = Math.min(Math.max(0.125, scale), 4);
    window.localStorage.setItem("scale", scale);

    moveScale += event.deltaY * 0.01;

    moveScale = Math.min(Math.max(0.125, moveScale), 4);

    drawGrid();
}

const scrollX = document.getElementById("scrollX-container");
const scrollY = document.getElementById("scrollY-container");

scrollX.scrollLeft = c.width/2;
scrollY.scrollTop = c.height/2;

scrollX.onscroll = (event) => {
    offsetX = scrollX.scrollLeft - c.width/2;

    drawGrid();
}

function offset(event) {
    offsetX -= event.deltaX * moveScale;
    console.log(c.width/2 - offsetX * 16);
    scrollX.scrollLeft = c.width/2 - offsetX * 16;

    offsetY -= event.deltaY * moveScale;
    scrollY.scrollTop = c.height/2 - offsetY * 16;

    drawGrid();
}

let scale = 1;
let gridScale = 1.25;
let moveScale = 2.85;

window.localStorage.setItem("scale", scale);
window.localStorage.setItem("gridScale", gridScale);

c.onwheel = (e) => {
    e.preventDefault();
    if (e.ctrlKey) {
        zoom(e);
    } else {
        offset(e);
    }
};

drawGrid();
onresize = () => {
    drawGrid();
}

c.oncontextmenu = (e) => {e.preventDefault();}

c.onpointerdown = (e) => {
    e.preventDefault();
    if (e.button === 2) {
        c.style.cursor = "url(img/cursors/EraserDown-32.png), pointer";
    } else {
        c.style.cursor = "url(img/cursors/PaintDown-32.png), pointer";
    }
}

c.onpointerup = (e) => {
    e.preventDefault();
    c.style.cursor = "url(img/cursors/Paint-32.png), pointer";
}