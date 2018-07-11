var hypercore = require("hypercore")
var hyperdiscovery = require("hyperdiscovery")
var randomWords = require('random-words')

var feed = hypercore("./cores/swarmtest", {valueEncoding: "json"})

var swarm
feed.on("ready", function() {
    console.log(feed.key.toString("hex"))
    swarm = hyperdiscovery(feed, {port: 1001, tcp: true, utp: true})
    swarm.on("connection", function(peer, type) {
        console.log("we had a connection")
    })
})

setInterval(()=>{ feed.append({item: randomWords()}) }, 1000);
