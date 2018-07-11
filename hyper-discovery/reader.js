const hypercore = require("hypercore");
const hyperdiscovery = require("hyperdiscovery");
const ram = require("random-access-memory");

const remote = process.argv[2] || '6644879327d3aea348b24086e392e157105035a296640f1bd7ff05d70d275064';

console.log(`Currently connecting to ${remote} hypercore`);
console.log("Alternative usage: node hyperRead.js <key from writer.js|other hypercore key>");

const feed = hypercore(ram, remote, {
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
        download: true
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