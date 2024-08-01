const c = document.createElement("canvas");
c.id = "canvas";
c.width = window.innerWidth;
c.height = window.innerHeight;
document.body.appendChild(c);

const ctx = c.getContext("2d");
let offsetX = 0;
let offsetY = 0;

function drawGrid(scale) {
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    ctx.strokeStyle = "grey";
    ctx.globalAlpha = 0.5;

    for (let y = 0; y < Math.ceil(c.height/scale); y += 1) {
        for (let x = 0; x < Math.ceil(c.width/scale); x += 1) {
            ctx.strokeRect(x*scale + offsetX*scale,y*scale + offsetY*scale,scale,scale);
        }
    }
}

function zoom(event) {
    event.preventDefault();

    scale += event.deltaY * -0.01;

    // Restrict scale
    scale = Math.min(Math.max(0.125, scale), 4);

    drawGrid(scale*64);
}

let scale = 1;
c.onwheel = (e) => {zoom(e)};

// c.onwheel = (e) => {console.log(e); offsetX = e.scrollLeft/64; offsetY = e.scrollTop/64; drawLayer();}

drawGrid(64);
onresize = () => {drawGrid(64);}

c.onpointerdown = () => {c.style.cursor = "url(img/cursors/PaintDown-32.png), pointer";}
c.onpointerup = () => {c.style.cursor = "url(img/cursors/Paint-32.png), pointer";}