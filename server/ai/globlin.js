module.exports = {
    main: function(ob) {
        if (Math.random < 0.05) {
            ob.direction = Math.random() * 360;
        }
        ob.y += Math.sin(ob.direction) * ob.stats.moveSpeed;
        ob.x += Math.cos(ob.direction) * ob.stats.moveSpeed;
    },
    init: function(ob) {
        ob.stats = {
            power: 10,
            health: 10,
            defense: 10,
            attackSpeed: 3,
            moveSpeed: 2,
            damageTaken: 0
        }
        ob.direction = Math.random() * 360;
    }
}