let canvas;
let ctx;

function resizeCanvas() {
    canvas.setAttribute("width", window.innerWidth);
    canvas.setAttribute("height", window.innerHeight);
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