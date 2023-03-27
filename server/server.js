let port = 41399;

if (process.argv.length > 2) {
    port = parseInt(process.argv[2]);
}

const http = require("http");
const ws = require("ws");
const fs = require("fs");

////////// HTTP SERVER //////////

const fileMap = new Map();

let files = fs.readdirSync("client/");
for (let i = 0; i < files.length; i++) {
    fs.readFile("client/" + files[i], (err, data) => {
        if (!err) {
            let extension = files[i].substring(files[i].lastIndexOf("."));
            let contentType = 0;
            if (extension === ".js") {
                contentType = "application/javascript";
            }
            else if (extension === ".html") {
                contentType = "text/html";
            }
            else if (extension === ".css") {
                contentType = "text/css";
            }
            else {
                contentType = "text/plain";
            }
            fileMap.set(files[i], [data, contentType]);
        }
    })
}

const httpServer = http.createServer((req, res) => {
    if (req.url === "/") {
        req.url = "index.html";
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

wsServer.on("connection", (websocket) => {
    let id = websockets.length;
    websockets.push(websocket);
    console.log(id + " connected");
    websocket.on("message", (data) => {
        let msg = data + "";
        console.log(id + ":" + msg);
    });
    websocket.on("close", () => {
        console.log(id + " closed");
    });
    websocket.on("error", () => {
        console.log(id + " error");
    });
});

httpServer.listen(port);