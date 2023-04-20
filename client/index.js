const DEBUG_IMAGE_RECT_COLOR = "green";
const DEBUG_NO_IMAGE_RECT_COLOR = "gray";
const DEBUG_COLLISION_RECT_COLOR = "red";

let debug = true;

let canvas;
let ctx;
let camX = 0;
let camY = 0;

let midX = 0;
let midY = 0;

let focusedOb = null;
let obs = [];
let socket;

function resizeCanvas() {
    canvas.setAttribute("width", window.innerWidth);
    canvas.setAttribute("height", window.innerHeight);
    midX = window.innerWidth / 2;
    midY = window.innerHeight / 2;
}

window.onload = () => {
    canvas = document.getElementsByTagName("canvas")[0];
    ctx = canvas.getContext("2d");
    resizeCanvas();

    myimage = new Image();
    myimage.onload = () => {
        obs.push({name: "monster", x: 100, y: 100, width: 200, height: 200, image: myimage, halfWidth: 100, halfHeight: 100, halfImageWidth: myimage.width / 2, halfImageHeight: myimage.height / 2});
        obs.push({name: "invis", x: 200, y: 200, width: 50, height: 50, image: null, halfWidth: 25, halfHeight: 25});
    }
    myimage.src = "client/images/monster.png";

    socket = new WebSocket("ws://" + window.location.host);
}

window.onresize = () => {
    resizeCanvas();
}

setInterval(render, 50);

function render() {
    for (let i = 0; i < obs.length; i++) {
        let o = obs[i];
        ctx.fillStyle = "black";
        ctx.font = "20px Courier New";
        ctx.fillText(o.name, o.x + midX - o.halfWidth, o.y + midY - o.halfHeight - 2);
        if (o.image != null) {
            ctx.drawImage(
                o.image, 
                o.x - camX + midX - o.halfImageWidth,
                o.y - camY + midY - o.halfImageHeight,
                o.image.width,
                o.image.height
            );
        }
        //todo put this if outside the for?
        if (debug) {
            if (o.image === null) {
                ctx.strokeStyle = DEBUG_NO_IMAGE_RECT_COLOR;
                ctx.strokeRect(o.x - 10 + midX, o.y - 10 + midY, 20, 20);
            }
            else { 
                ctx.strokeStyle = DEBUG_IMAGE_RECT_COLOR;
                ctx.strokeRect(o.x - o.halfImageWidth + midX, o.y - o.halfImageHeight + midY, o.image.width, o.image.height);
            }
            ctx.strokeStyle = DEBUG_COLLISION_RECT_COLOR;
            ctx.strokeRect(o.x - o.halfWidth + midX, o.y - o.halfHeight + midY, o.width, o.height);
        }
    }
}