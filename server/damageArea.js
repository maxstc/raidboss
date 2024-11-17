function createDamageArea(x, y, width, height, ttl, projectile, immune, damage) {
    return {
        x: x,
        y: y,
        obdata: {
            name: "none",
            width: width,
            height: height,
            script: {
                main: function (ob, obs) {
                    //do nothing
                },
                init: function (ob, obs) {
                    //do nothing
                },
                collision: function (collider, ob, obs) {
                    for (let i = 0; i < immune.length; i++) {
                        if (immune[i] === collider) {
                            return;
                        }
                    }
                    if (collider.stats != undefined) {
                        if (collider.stats.health != undefined) {
                            collider.stats.health -= damage;
                        }
                    }
                }
            },
            damage: damage,
            immune: immune,
            projectile: projectile,
            ttl: ttl,
            collisionType: COLLISION_IGNORE
        }
    };
}