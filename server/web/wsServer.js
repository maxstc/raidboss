const ws = require("ws");

let websockets = [];

module.exports = {
    startWsServer: (httpServer) => {
        //create websocket server
        const wsServer = new ws.WebSocketServer({ server: httpServer });

        wsServer.on("connection", onConnection(websocket));
    },
    sendObData: sendObData
}

function onConnection (websocket) {
    //assign an id number to the websocket connection
    let id = websockets.length;
    //tell the client what their id number is
    websocket.send(id);
    //add the connection to the websocket list
    websockets.push(websocket);
    console.log(id + " connected");
    //create a player for this connection
    let playerOb = addPlayer(id);
    //when we receive data from the websocket
    websocket.on("message", (data) => {
        //parse the message
        let msg = JSON.parse(data + "");
        parseClientMessage(playerOb, msg);
    });
    //when the websocket is closed
    websocket.on("close", () => {
        console.log(id + " closed");
    });
    //when the websocket has an error
    websocket.on("error", () => {
        console.log(id + " error");
    });
}

function parseClientMessage(playerOb, msg) {
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
}

function sendObData(obs) {
    let clientObs = [];
    for (let i = 0; i < sim.obs.length; i++) {
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