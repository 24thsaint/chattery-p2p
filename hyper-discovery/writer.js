const hypercore = require("hypercore");
const hyperdiscovery = require("hyperdiscovery");
const randomWords = require('random-words');

const feed = hypercore("./cores/swarmtest", {
    valueEncoding: "json"
});

let swarm;

feed.on("ready", function () {
    console.log(feed.key.toString("hex"));
    swarm = hyperdiscovery(feed, {
        port: 5000,
        tcp: true,
        utp: true,
        download: true
    });
    swarm.on("connection", function (peer, type) {
        console.log("We have a connection");
    });
});

setInterval(() => {
    feed.append({
        item: randomWords()
    });
}, 1000);