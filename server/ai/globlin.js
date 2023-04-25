module.exports = {
    main: function(ob) {
        if (Math.random < 0.05) {
            ob.direction = Math.random() * 360;
        }
        ob.dy = Math.sin(ob.direction) * 5;
        ob.dx = Math.cos(ob.direction) * 5;
    },
    init: function(ob) {
        ob.direction = Math.random() * 360;
    }
}