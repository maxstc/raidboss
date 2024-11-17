let obs = [];

function gameTick() {
    //Do script & move
    scriptTick();
    //Move obs
    // moveTick();
    //Handle ob collision
    collisionTick();
    //Send data to players
    sendObData();
}

function scriptTick() {
    for (let i = 0; i < obs.length; i++) {
        obs[i].obdata.script.main(obs[i], obs);
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
        obdata.GLOBLIN_A.script.init(obs[obs.length-1], obs);
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
    handleCollision(ob1, ob2);
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
    newPlayer.obdata.script.init(newPlayer, obs);
    return newPlayer;
}

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