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
        let msg = JSON.parse(data + "");
        if (msg.inputType === "move") {
            if (msg.value === "left") {
                playerOb.dx = -1;
            }
            else if (msg.value === "right") {
                playerOb.dx = 1;
            }
            else if (msg.value === "up") {
                playerOb.dy = -1;
            }
            else if (msg.value === "down") {
                playerOb.dy = 1;
            }
        }
        else if (msg.inputType === "stopMove") {
            if (msg.value === "left" && playerOb.dx === -1) {
                playerOb.dx = 0;
            }
            else if (msg.value === "right" && playerOb.dx === 1) {
                playerOb.dx = 0;
            }
            else if (msg.value === "up" && playerOb.dy === -1) {
                playerOb.dy = 0;
            }
            else if (msg.value === "down" && playerOb.dy === 1) {
                playerOb.dy = 0;
            }
        }
        else if (msg.inputType === "attack") {
            //do nothing
        }
        else if (msg.inputType === "stopAttack") {
            //do nothing
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

function between(a, b, c) {
    return a >= b && a <= c;
}

//TODO
//This function can be made more efficient
//Potential fix to the issue that required that i have the one big wall thing:
//On collision, when we find a potential translation that would make no collision with that object, do a collision check with that object's new potential position.
//then, if there is still a collision, then try another potential translation.
//if all potential translations have been tried, give up and hope another object will work.
//mark the object and have it die if it doesnt fix it by the end of the collision checks? (idk)
function collision(ob1, ob2) {
    if (ob1.obdata.collisionType === obdata.COLLISION_IGNORE || ob2.obdata.collisionType === obdata.COLLISION_IGNORE) {
        return;
    }
    //0
    let leftDist = ob2.right - ob1.left;
    //1
    let rightDist = ob1.right - ob2.left;
    //2
    let topDist = ob2.bottom - ob1.top;
    //3
    let bottomDist = ob1.bottom - ob2.top;

    if (leftDist < 0 || rightDist < 0 || topDist < 0 || bottomDist < 0) {
        //no collision
    }
    else {
        handleCollision(ob1, ob2);
        if (
            (ob1.obdata.collisionType === obdata.COLLISION_OB && ob2.obdata.collisionType === obdata.COLLISION_WALL)
            ||
            (ob2.obdata.collisionType === obdata.COLLISION_OB && ob1.obdata.collisionType === obdata.COLLISION_WALL)
            ) {
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

            if (ob1.obdata.collisionType === obdata.COLLISION_WALL) {
                //move ob2 direction of index
                switch(minDistIndex) {
                    case 0:
                        ob2.x -= minDistValue;
                    break;
                    case 1:
                        ob2.x += minDistValue;
                    break;
                    case 2:
                        ob2.y -= minDistValue;
                    break;
                    case 3:
                        ob2.y += minDistValue;
                    break;
                }
            }
            else {
                //move ob1 opposite direction of index
                switch(minDistIndex) {
                    case 0:
                        ob1.x += minDistValue;
                    break;
                    case 1:
                        ob1.x -= minDistValue;
                    break;
                    case 2:
                        ob1.y += minDistValue;
                    break;
                    case 3:
                        ob1.y -= minDistValue;
                    break;
                }
            }

        }
    }
}

function handleCollision(ob1, ob2) {
    //run collision handler functions of ob1 and ob2
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

// obs.push({
//     x: 0, 
//     y: 0,
//     obdata: obdata.DOG
// });
// obdata.DOG.ai.init(obs[obs.length-1]);

//add boundaries
for (let x = -10; x <= 10; x++) {
    for (let y = -10; y <= 10; y++) {
        if (x === -10 || x === 10 || y === -10 || y === 10) {
            obs.push({
                x: x * 160,
                y: y * 160,
                obdata: obdata.WALL
            });
        }
        else {
            obs.push({
                x: x * 160,
                y: y * 160,
                obdata: obdata.FLOOR
            });
        }
    }
}
obs.push(obdata.createWall(0, 160*10, 3200, 160));
obs.push(obdata.createWall(0, -160*10, 3200, 160));
obs.push(obdata.createWall(160*10, 0, 160, 3200));
obs.push(obdata.createWall(-160*10, 0, 160, 3200));

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