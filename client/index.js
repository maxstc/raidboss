const DEBUG_IMAGE_RECT_COLOR = "green";
const DEBUG_COLLISION_RECT_COLOR = "red";

let debug = true;

let canvas;
let ctx;
let camX = 0;
let camY = 0;

let midX = 0;
let midY = 0;

let sprites = [];

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
        sprites.push({x: 100, y: 100, width: 200, height: 200, image: myimage, halfWidth: 100, halfHeight: 100, halfImageWidth: myimage.width / 2, halfImageHeight: myimage.height / 2});
    }
    myimage.src = "client/images/monster.png";
}

window.onresize = () => {
    resizeCanvas();
}

setInterval(render, 50);

function render() {
    for (let i = 0; i < sprites.length; i++) {
        let s = sprites[i];
        ctx.drawImage(
            s.image, 
            s.x - camX + midX - s.halfImageWidth,
            s.y - camY + midY - s.halfImageHeight,
            s.image.width,
            s.image.height
        );
        //todo put this if outside the for?
        if (debug) {
            if (s.image === null) {
                console.log("tell max to put a circle here");
            }
            else { 
                ctx.strokeStyle = DEBUG_IMAGE_RECT_COLOR;
                console.log(s.image.width);
                ctx.strokeRect(s.x - s.halfImageWidth + midX, s.y - s.halfImageHeight + midY, s.image.width, s.image.height);
            }
            ctx.strokeStyle = DEBUG_COLLISION_RECT_COLOR;
            ctx.strokeRect(s.x - s.halfWidth + midX, s.y - s.halfHeight + midY, s.width, s.height);
        }
    }
}