# use `npm ci` instead of `npm install`
# only required library is `ws` from npm
# run `node server/server.js`
# or run `node server/server.js <port>`

# todo
- make globlin ai better
- let clients attack obs and use stats

# backlog
- let clients pick a class
- make the level better
- improve performance

# note to self
- adjacent hitboxes can create issues. have all map objects and walls ignore collisions, then create invisible (potentially overlapping) collision boxes.