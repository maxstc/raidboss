let port = 41399;

//Can pass port as first argument (or leave empty for default value)
if (process.argv.length > 2) {
    port = parseInt(process.argv[2]);
}

const http = require("http");
const ws = require("ws");
const fs = require("fs");

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

//Start the HTTP server (and websocket server)
httpServer.listen(port);