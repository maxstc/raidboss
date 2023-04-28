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

let images = {};
images["none"] = -1;

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

    socket = new WebSocket("ws://" + window.location.host);

    socket.onmessage = (event) => {
        console.log(event.data);
        obs = JSON.parse(event.data);
    }
}

window.onresize = () => {
    resizeCanvas();
}

setInterval(render, 50);

function render() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let i = 0; i < obs.length; i++) {
        let o = obs[i];
        if (images[o.imagesrc] === undefined) {
            images[o.imagesrc] = 0;
            let newImage = new Image();
            newImage.onload = () => {
                images[o.imagesrc] = newImage;
            }
            newImage.src = "client/images/" + o.imagesrc;
        }
        
        if (images[o.imagesrc] === 0) {
            //its loading, just wait
            console.log("IMAGE LOADING");
        }
        else {
            ctx.drawImage(
                images[o.imagesrc], 
                o.x - camX + midX - images[o.imagesrc].width / 2,
                o.y - camY + midY - images[o.imagesrc].height / 2,
                images[o.imagesrc].width,
                images[o.imagesrc].height
            );
        }

        ctx.fillStyle = "black";
        ctx.font = "20px Courier New";
        ctx.fillText(o.name, o.x + midX - o.width / 2, o.y + midY - o.height / 2 - 2);

        //todo put this if outside the for?
        if (debug) {
            console.log("DEBUG:" + o.imagesrc);
            if (o.imagesrc === "none") {
                ctx.strokeStyle = DEBUG_NO_IMAGE_RECT_COLOR;
                ctx.strokeRect(o.x - 10 + midX, o.y - 10 + midY, 20, 20);
            }
            else {
                ctx.strokeStyle = DEBUG_IMAGE_RECT_COLOR;
                ctx.strokeRect(
                    o.x - (images[o.imagesrc].width / 2) + midX, 
                    o.y - images[o.imagesrc].height / 2 + midY, 
                    images[o.imagesrc].width, 
                    images[o.imagesrc].height);
            }
            ctx.strokeStyle = DEBUG_COLLISION_RECT_COLOR;
            ctx.strokeRect(o.x - o.width / 2 + midX, o.y - o.height / 2 + midY, o.width, o.height);
        }
    }
}