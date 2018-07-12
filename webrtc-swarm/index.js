const swarm = require('webrtc-swarm')
const signalhub = require('signalhub')

const hub = signalhub('swarm-example', ['https://signalhub-router.herokuapp.com/'])

const sw = swarm(hub, {
  wrtc: require('wrtc') // don't need this if used in the browser
})

sw.on('peer', function (peer, id) {
  console.log('connected to a new peer:', id)
  console.log('total peers:', sw.peers.length)
})

sw.on('disconnect', function (peer, id) {
  console.log('disconnected from a peer:', id)
  console.log('total peers:', sw.peers.length)
})
