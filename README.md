# use `npm ci` instead of `npm install`
# only required library is `ws` from npm
# run `node server/server.js`
# or run `node server/server.js <port>`

# todo
- let clients attack obs and use stats

# backlog
- classes
- design level
- improve globlin ai

# note to self
- adjacent hitboxes can create issues. have all map objects and walls ignore collisions, then create invisible (potentially overlapping) collision boxes.
- can be fixed by checking collisions after moving and finding a translation that resolve *all* translations