let port = 41399;

//Can pass port as first argument (or leave empty for default value)
if (process.argv.length > 2) {
    port = parseInt(process.argv[2]);
}

const http = require("http");
const ws = require("ws");
const fs = require("fs");

const obdata = require("./obdata");

const MS_PER_UPDATE = 50;
let last_update = 0;

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
    websocket.send(id);
    websockets.push(websocket);
    console.log(id + " connected");
    let playerOb = addPlayer(id);
    websocket.on("message", (data) => {
        let msg = data + "";
        console.log(id + ":" + msg);
        if (msg === "0") {
            playerOb.dx = -1;
        }
        else if (msg === "1") {
            playerOb.dx = 1;
        }
        else if (msg === "2") {
            playerOb.dy = -1;
        }
        else if (msg === "3") {
            playerOb.dy = 1;
        }

        else if (msg === "4" && playerOb.dx === -1) {
            playerOb.dx = 0;
        }
        else if (msg === "5" && playerOb.dx === 1) {
            playerOb.dx = 0;
        }
        else if (msg === "6" && playerOb.dy === -1) {
            playerOb.dy = 0;
        }
        else if (msg === "7" && playerOb.dy === 1) {
            playerOb.dy = 0;
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

function collisionTick() {
    for (let i = 0; i < obs.length; i++) {
        obs[i].left = obs[i].x - obs[i].obdata.width / 2;
        obs[i].right = obs[i].x + obs[i].obdata.width / 2;
        obs[i].top = obs[i].y - obs[i].obdata.height / 2;
        obs[i].bottom = obs[i].y + obs[i].obdata.height / 2;
    }
    for (let i = 0; i < obs.length; i++) {
        for (let j = i + 1; j < obs.length; j++) {
            collision(obs[i], obs[j]);
        }
    }
    // if (Math.random() < 0.01) {
    //     //create a new globlin
    //     console.log("new globlin");
    //     obs.push({
    //         x: 0, 
    //         y: 0,
    //         obdata: obdata.GLOBLIN_A
    //     });
    //     obdata.GLOBLIN_A.ai.init(obs[obs.length-1]);
    // }
}

function between(a, b, c) {
    return a >= b && a <= c;
}

//TODO
//This function can be made more efficient
//ALSO: we dont detect the collision if ob2 is inside ob1.. sorry :D
function collision(ob1, ob2) {
    //0
    let leftDist = ob2.right - ob1.left;
    //1
    let rightDist = ob1.right - ob2.left;
    //2
    let topDist = ob2.bottom - ob1.top;
    //3
    let bottomDist = ob1.bottom - ob2.top;

    console.log(`${leftDist}\t${rightDist}\t${topDist}\t${bottomDist}`);

    if (leftDist < 0 || rightDist < 0 || topDist < 0 || bottomDist < 0) {
        //no collision
    }
    else {
        handleCollision(ob1, ob2);

        if (ob1.isWall != ob2.isWall) {
            let minDistIndex = 0;
            let minDistValue = leftDist;

            if (rightDist < minDistValue) {
                minDistIndex = 1;
                minDistValue = rightDist;
            }
            if (topDist < minDistValue) {
                minDistIndex = 2;
                minDistValue = topDist;
            }
            if (bottomDist < minDistValue) {
                minDistIndex = 3;
                minDistValue = bottomDist;
            }
        }

    }
}

function handleCollision(ob1, ob2) {
    console.log("COLLISION");
}

function addPlayer(playerId) {
    let newPlayer = {
        x: 0,
        y: 0,
        playerId: playerId,
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
            playerId: obs[i].playerId
        });
    }
    for (let i = 0; i < websockets.length; i++) {
        websockets[i].send(JSON.stringify(clientObs));
    }
}

obs.push({
    x: 0, 
    y: 0,
    obdata: obdata.DOG
});
obdata.DOG.ai.init(obs[obs.length-1]);

last_update = Date.now();
setInterval(() => {
    let cur_time = Date.now();
    for (let i = 0; i < (cur_time - last_update) / MS_PER_UPDATE; i++) {
        last_update = cur_time;
        gameTick();
    }
}, 10);

//Start the HTTP server (and websocket server)
httpServer.listen(port);