const hyperdrive = require('hyperdrive')
const swarm = require('hyperdiscovery')

const archive = hyperdrive('./database', 'ARCHIVE_KEY')
const sw = swarm(archive)
sw.on('connection', function (peer, type) {
  console.log('got', peer, type) 
  console.log('connected to', sw.connections.length, 'peers')
  peer.on('close', function () {
    console.log('peer disconnected')
  })
})