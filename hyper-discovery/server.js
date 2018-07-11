const hypercore = require("hypercore");
const hyperdiscovery = require("hyperdiscovery");
const randomWords = require('random-words');

const feed = hypercore("./cores/swarmtest", {valueEncoding: "json"});

const swarm;

feed.on("ready", function() {
    console.log(feed.key.toString("hex"));
    swarm = hyperdiscovery(feed, {port: 5000, tcp: true, utp: true});
    swarm.on("connection", function(peer, type) {
        console.log("we had a connection");
    });
});

setInterval(()=>{ feed.append({item: randomWords()}) }, 1000);
