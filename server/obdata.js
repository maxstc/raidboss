const aipack = require("./aipack");

const GLOBLIN_A = {
    name: "globlin_a.png",
    width: 100,
    height: 100,
    ai: aipack.globlin
}

const PLAYER = {
    name: "knight.png",
    width: 100,
    height: 100,
    ai: aipack.player
}

module.exports = {
    GLOBLIN_A: GLOBLIN_A,
    PLAYER: PLAYER
}