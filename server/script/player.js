module.exports = {
    main: function(ob) {
        ob.x += ob.dx * ob.stats.moveSpeed;
        ob.y += ob.dy * ob.stats.moveSpeed;
    },
    init: function(ob) {
        ob.stats = {
            power: 10,
            health: 10,
            defense: 10,
            attackSpeed: 3,
            moveSpeed: 3,
            damageTaken: 0
        }
        ob.dx = 0;
        ob.dy = 0;
    }
}