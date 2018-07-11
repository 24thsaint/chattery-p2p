var hypercore = require("hypercore")
var hyperdiscovery = require("hyperdiscovery")
var ram = require("random-access-memory")

var remote = 'a647b0c432f3bf941862b53da899f135b17953f51f868672e8d3cc39c81731a3'
if (!remote) {
    console.log("usage: node hyperRead.js <key from swarm-write.js|other hypercore key>")
    process.exit()
}
var feed = hypercore(ram, remote, {valueEncoding: "json"})

var swarm
feed.on("ready", function() {
    console.log(feed.key.toString("hex"))
    swarm = hyperdiscovery(feed, {live: true, download: true})

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