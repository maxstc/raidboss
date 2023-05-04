const aipack = require("./aipack");

const DOG = {
    name: "dog_pixel.png",
    width: 80,
    height: 80,
    ai: aipack.base
}

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
    DOG: DOG,
    GLOBLIN_A: GLOBLIN_A,
    PLAYER: PLAYER
}