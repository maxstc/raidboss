let canvas;

function resizeCanvas() {
    canvas.setAttribute("width", window.innerWidth);
    canvas.setAttribute("height", window.innerHeight);
    console.log(canvas.getAttribute("width"));
}

window.onload = () => {
    canvas = document.getElementsByTagName("canvas")[0];
    resizeCanvas();
}

window.onresize = () => {
    resizeCanvas();
}