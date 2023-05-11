# use `npm ci` instead of `npm install`
# only required library is `ws` from npm
# run `node server/server.js`
# or run `node server/server.js <port>`

# todo
- make globlin ai better
- improve performance

# backlog
- let clients attack obs and use stats
- let clients pick a class
- make the level better

# note to self
- adjacent hitboxes can create issues. have all map objects and walls ignore collisions, then create invisible (potentially overlapping) collision boxes.