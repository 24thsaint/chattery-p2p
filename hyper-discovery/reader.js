const hypercore = require("hypercore");
const hyperdiscovery = require("hyperdiscovery");

const remote = process.argv[2] || '41144b26d44dc50633811d7d3c1cd9773e0fea4cd2d7c3d59656397298dc201e';

console.log(`Currently connecting to ${remote} hypercore`);
console.log("Alternative usage: node hyperRead.js <key from writer.js|other hypercore key>");

const feed = hypercore('./data', remote, {
    valueEncoding: "json"
});

let swarm;

feed.on("ready", function () {
    console.log(feed.key.toString("hex"));
    swarm = hyperdiscovery(feed, {
        live: true,
        port: 6000,
        tcp: true,
        utp: true,
        download: true,
        upload: true
    });

    swarm.on("connection", function (peer, type) {
        console.log("I have a connection");
    });

    swarm.on('data', (data) => {
        console.log('SWARM', data.toString());
    });
});

const stream = feed.createReadStream({
    start: 0,
    live: true
});

stream.on("data", function (data) {
    console.log("data", data);
})

feed.on('sync', () => {
    console.log('feed synced');
});