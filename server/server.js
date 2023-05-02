let port = 41399;

//Can pass port as first argument (or leave empty for default value)
if (process.argv.length > 2) {
    port = parseInt(process.argv[2]);
}

const http = require("http");
const ws = require("ws");
const fs = require("fs");

const obdata = require("./obdata");

////////// HTTP SERVER //////////

//To store data of static files to be served
const fileMap = new Map();

//Read in all files in the client/ directory
readFolderRecurse("client/");

function readFolderRecurse(path) {
    let files = fs.readdirSync(path);
    for (let i = 0; i < files.length; i++) {
        let currentPath = path + files[i];
        if (fs.statSync(currentPath).isDirectory()) {
            readFolderRecurse(currentPath + "/");
        }
        else {
            fs.readFile(currentPath, (err, data) => {
                if (!err) {
                    fileMap.set(currentPath, [data, mime(files[i])]);
                }
                else {
                    console.log("Error reading file: " + currentPath);
                }
            });
        }
    }
}

function mime(fileName) {
    let extension = fileName.substring(fileName.lastIndexOf("."));
    if (extension === ".js") {
        return "application/javascript";
    }
    else if (extension === ".html") {
        return "text/html";
    }
    else if (extension === ".css") {
        return "text/css";
    }
    else if (extension === ".png") {
        return "image/png";
    }
    return "text/plain";
}

//HTTP static server
const httpServer = http.createServer((req, res) => {
    if (req.url === "/") {
        req.url = "client/index.html";
    }
    else if (req.url.charAt(0) === "/") {
        req.url = req.url.substring(1);
    }

    let fileMapEntry = fileMap.get(req.url);
    if (fileMapEntry === undefined) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("Requested file not found.");
    }
    else {
        res.writeHead(200, {"Content-Type": fileMapEntry[1]});
        res.end(fileMapEntry[0]);
    }
});

////////// WEBSOCKETS //////////

const wsServer = new ws.WebSocketServer({ server: httpServer });

let websockets = [];

//Websocket server
wsServer.on("connection", (websocket) => {
    let id = websockets.length;
    websockets.push(websocket);
    console.log(id + " connected");
    let playerOb = addPlayer();
    websocket.on("message", (data) => {
        let msg = data + "";
        console.log(id + ":" + msg);
        if (msg === "a") {
            console.log("OKAYOKAY");
            console.log(playerOb);
            playerOb.dx = 1;
        }
    });
    websocket.on("close", () => {
        console.log(id + " closed");
    });
    websocket.on("error", () => {
        console.log(id + " error");
    });
});

////////// GAME LOGIC //////////

let obs = [];

function gameTick() {
    //Do ai & move
    aiTick();
    //Move obs
    // moveTick();
    //Handle ob collision
    collisionTick();
    //Send data to players
    sendObData();
}

function aiTick() {
    for (let i = 0; i < obs.length; i++) {
        obs[i].obdata.ai.main(obs[i]);
    }
}

// function moveTick() {
//     for (let i = 0; i < obs.length; i++) {
//         obs[i].x += obs[i].dx;
//         obs[i].y += obs[i].dy;
//         obs[i].dx = 0;
//         obs[i].dy = 0;
//     }
// }

function collisionTick() {
    for (let i = 0; i < obs.length; i++) {
        for (let j = i + 1; j < obs.length; j++) {
            if (isColliding(obs[i], obs[j])) {
                handleCollision(i, obs[i], j, obs[j]);
            }
        }
    }
    if (Math.random() < 0.01) {
        //create a new globlin
        console.log("new globlin");
        obs.push({
            x: 0, 
            y: 0,
            obdata: obdata.GLOBLIN_A
        });
        obdata.GLOBLIN_A.ai.init(obs[obs.length-1]);
    }
}

function isColliding() {
    return false;
}

function addPlayer() {
    let newPlayer = {
        x: 0,
        y: 0,
        obdata: obdata.PLAYER
    }
    newPlayer.obdata.ai.init(newPlayer);
    obs.push(newPlayer);
    console.log("new player");
    return newPlayer;
}

function sendObData() {
    let clientObs = [];
    for (let i = 0; i < obs.length; i++) {
        clientObs.push({
            name: obs[i].obdata.name,
            x: obs[i].x,
            y: obs[i].y,
            width: obs[i].obdata.width,
            height: obs[i].obdata.height,
            imagesrc: obs[i].obdata.name,
        });
    }
    for (let i = 0; i < websockets.length; i++) {
        websockets[i].send(JSON.stringify(clientObs));
    }
}

setInterval(gameTick, 100);

//Start the HTTP server (and websocket server)
httpServer.listen(port);