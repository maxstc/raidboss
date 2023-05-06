const aipack = require("./aipack");

const DOG = {
    name: "dog_pixel.png",
    width: 200,
    height: 200,
    isWall: true,
    ai: aipack.base
}

const GLOBLIN_A = {
    name: "globlin_a.png",
    width: 100,
    height: 100,
    isWall: false,
    ai: aipack.globlin
}

const PLAYER = {
    name: "knight.png",
    width: 100,
    height: 100,
    isWall: false,
    ai: aipack.player
}

module.exports = {
    DOG: DOG,
    GLOBLIN_A: GLOBLIN_A,
    PLAYER: PLAYER
}