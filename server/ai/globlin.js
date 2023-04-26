module.exports = {
    main: function(ob) {
        if (Math.random < 0.05) {
            ob.direction = Math.random() * 360;
        }
        ob.y += Math.sin(ob.direction) * 5;
        ob.x += Math.cos(ob.direction) * 5;
    },
    init: function(ob) {
        ob.direction = Math.random() * 360;
    }
}