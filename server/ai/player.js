module.exports = {
    main: function(ob) {
        ob.x += ob.dx;
        ob.y += ob.dy;
        ob.dx = 0;
        ob.dy = 0;
    },
    init: function(ob) {
        ob.dx = 0;
        ob.dy = 0;
    }
}