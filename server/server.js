const httpServer = require("httpServer.js");
const wsServer = require("wsServer.js");
const sim = require("game/sim.js");

//Run server on this port
let port = 41399;

//Can pass port as first argument (or leave empty for default value)
if (process.argv.length > 2) {
    port = parseInt(process.argv[2]);
}

//create http server
let server = httpServer.startServer();
//attach ws server
wsServer.startWsServer(server);
//create game simulation and give client updater function
let gameSim = sim.createSim(wsServer.sendObData);
//Start the HTTP server
server.listen(port);