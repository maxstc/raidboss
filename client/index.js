const DEBUG_IMAGE_RECT_COLOR = "green";
const DEBUG_COLLISION_RECT_COLOR = "red";

let canvas;
let ctx;
let camX;
let camY;

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
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(myimage, 100, 100, myimage.width*8, myimage.height*8);
    }
    myimage.src = "client/images/monster.png";
}

window.onresize = () => {
    resizeCanvas();
}

function render() {
    for (let i = 0; i < sprites.length; i++) {
        let s = sprites[i];
        ctx.drawImage(
            s.image, 
            s.x - camX + midX - s.halfWidth,
            s.y - camY + midY - s.halfHeight,
            s.width,
            s.height
        );
        //todo put this if outside the for?
        if (debug) {
            if (s.image === null) {

            }
            else { 
                ctx.strokeStyle = DEBUG_IMAGE_RECT_COLOR;
                ctx.strokeRect(s.x - (s.image.width / 2), s.y - (s.image.height / 2), s.image.width, s.image.height);
            }
            ctx.strokeStyle = DEBUG_COLLISION_RECT_COLOR;
            ctx.strokeRect(s.x - s.halfWidth, s.y - s.halfHeight, s.width, s.height);
        }
    }
}