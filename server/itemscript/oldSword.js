require("../damageArea.js");

module.exports = {
    onUse: function(ob, obs) {
        obs.push(createDamageArea(0, 0, 100, 100, 100, false, [], 10));
    }
}