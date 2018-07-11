var hypercore = require("hypercore")
var hyperdiscovery = require("hyperdiscovery")
var ram = require("random-access-memory")

var remote = '6644879327d3aea348b24086e392e157105035a296640f1bd7ff05d70d275064'
if (!remote) {
    console.log("usage: node hyperRead.js <key from swarm-write.js|other hypercore key>")
    process.exit()
}
var feed = hypercore(ram, remote, {valueEncoding: "json"})

var swarm
feed.on("ready", function() {
    console.log(feed.key.toString("hex"))
    swarm = hyperdiscovery(feed, {live: true, port: 1001, tcp: true, utp: true})

    swarm.on("connection", function(peer, type) {
        console.log("i had a connection")
    })

    swarm.on('data', (data) => {
        console.log('SWARM', data.toString())
    })
})
var stream = feed.createReadStream({start: 0, live: true})
stream.on("data", function(data) {
    console.log("data", data)    
})

feed.on('sync', () => {
    console.log('feed synced')
})