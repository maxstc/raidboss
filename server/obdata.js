const aipack = require("./aipack");

const COLLISION_IGNORE = 0;
const COLLISION_PROJECTILE = 1;
const COLLISION_OB = 2;
const COLLISION_WALL = 3;

//1 can collide with 1, 2, and 3
//2 can collide with 3

const DOG = {
    name: "dog_pixel.png",
    width: 200,
    height: 200,
    ai: aipack.base,
    collisionType: COLLISION_OB
}

const GLOBLIN_A = {
    name: "globlin_a.png",
    width: 100,
    height: 100,
    ai: aipack.globlin,
    collisionType: COLLISION_OB
}

const PLAYER = {
    name: "knight.png",
    width: 100,
    height: 100,
    ai: aipack.player,
    collisionType: COLLISION_OB
}

const FLOOR = {
    name: "stone.png",
    width: 160,
    height: 160,
    ai: aipack.base,
    collisionType: COLLISION_IGNORE
}

const WALL = {
    name: "wall.png",
    width: 160,
    height: 160,
    ai: aipack.base,
    collisionType: COLLISION_IGNORE
}

function createWall(x, y, w, h) {
    return {
        x: x,
        y: y,
        obdata: {
            name: "none",
            width: w,
            height: h,
            ai: aipack.base,
            collisionType: COLLISION_WALL
        }
    };
}

module.exports = {
    createWall: createWall,
    COLLISION_IGNORE: COLLISION_IGNORE,
    COLLISION_PROJECTILE: COLLISION_PROJECTILE,
    COLLISION_OB: COLLISION_OB,
    COLLISION_WALL: COLLISION_WALL,
    DOG: DOG,
    GLOBLIN_A: GLOBLIN_A,
    PLAYER: PLAYER,
    FLOOR: FLOOR,
    WALL: WALL
}