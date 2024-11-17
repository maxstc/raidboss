const http = require("http");
const fs = require("fs");

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

//get a mime type given a file name
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
module.exports = {
    startServer: () => {
        http.createServer((req, res) => {
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
    }
}