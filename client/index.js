const DEBUG_IMAGE_RECT_COLOR = "green";
const DEBUG_NO_IMAGE_RECT_COLOR = "gray";
const DEBUG_COLLISION_RECT_COLOR = "red";

let debug = false;
//let debug = true;

let canvas;
let ctx;
let camX = 0;
let camY = 0;

let midX = 0;
let midY = 0;

let focusedOb = null;
let obs = [];
let socket;
let targetOb = 0;
let playerId = -1;

let images = {};
images["none"] = -1;

function resizeCanvas() {
    canvas.setAttribute("width", window.innerWidth);
    canvas.setAttribute("height", window.innerHeight);
    midX = window.innerWidth / 2;
    midY = window.innerHeight / 2;
}

const KEY_LEFT = "KeyA";
const KEY_RIGHT = "KeyD";
const KEY_UP = "KeyW";
const KEY_DOWN = "KeyS";

window.onload = () => {
    canvas = document.getElementsByTagName("canvas")[0];
    ctx = canvas.getContext("2d");
    resizeCanvas();

    socket = new WebSocket("ws://" + window.location.host);

    socket.onmessage = (event) => {
        if (playerId === -1) {
            playerId = JSON.parse(event.data);
        }
        else {
            obs = JSON.parse(event.data);
            for (let i = 0; i < obs.length; i++) {
                if (obs[i].playerId === playerId) {
                    targetOb = obs[i];
                }
            }
        }
    }

    window.onkeydown = (key) => {
        console.log(key);
        if (key.code == KEY_LEFT) {
            socket.send("0");
        }
        else if (key.code == KEY_RIGHT) {
            socket.send("1");
        }
        else if (key.code == KEY_UP) {
            socket.send("2");
        }
        else if (key.code == KEY_DOWN) {
            socket.send("3");
        }
    }

    window.onkeyup = (key) => {
        console.log(key);
        if (key.code == KEY_LEFT) {
            socket.send("4");
        }
        else if (key.code == KEY_RIGHT) {
            socket.send("5");
        }
        else if (key.code == KEY_UP) {
            socket.send("6");
        }
        else if (key.code == KEY_DOWN) {
            socket.send("7");
        }
    }
}

window.onresize = () => {
    resizeCanvas();
}

setInterval(render, 50);

function render() {
    if (targetOb != 0) {
        camX += 0.1 * (targetOb.x - camX);
        camY += 0.1 * (targetOb.y - camY);
    }

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

        //todo put this if outside the for?
        if (debug) {

            ctx.fillStyle = "black";
            ctx.font = "20px Courier New";
            ctx.fillText(
                o.name, 
                o.x - camX + midX - o.width / 2, 
                o.y - camY + midY - o.height / 2 - 6);

            if (o.imagesrc === "none") {
                ctx.strokeStyle = DEBUG_NO_IMAGE_RECT_COLOR;
                ctx.strokeRect(
                    o.x - camX - 10 + midX, 
                    o.y - camY - 10 + midY, 
                    20, 
                    20);
            }
            else {
                ctx.strokeStyle = DEBUG_IMAGE_RECT_COLOR;
                ctx.strokeRect(
                    o.x - camX - (images[o.imagesrc].width / 2) + midX, 
                    o.y - camY - (images[o.imagesrc].height / 2) + midY, 
                    images[o.imagesrc].width, 
                    images[o.imagesrc].height);
            }
            ctx.strokeStyle = DEBUG_COLLISION_RECT_COLOR;
            ctx.strokeRect(
                o.x - camX - o.width / 2 + midX, 
                o.y - camY - o.height / 2 + midY, 
                o.width, 
                o.height);
        }
    }
}