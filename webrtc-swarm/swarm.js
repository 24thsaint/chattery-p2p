const swarm = require('webrtc-swarm');
const signalhub = require('signalhub');
const wrtc = require('wrtc');
const faker = require('faker');

class Swarm {
  constructor() {
    const hub = signalhub('swarm-example', ['http://signalhub-router.herokuapp.com/']);
    this.peers = {};

    this.sw = swarm(hub, {
      wrtc: wrtc
    });

    this.sw.on('peer', (peer, id) => {
      if (!this.peers[id]) {
        console.log('peer added')
        this.peers[id] = peer;

        peer.on('data', (data) => {
          console.log('Remote data: ' + data.toString())
        })
      }
      console.log('connected to a new peer:', id)
    });

    this.sw.on('disconnect', (peer, id) => {
      if (this.peers[id]) {
        delete this.peers[id];
      }
      console.log('disconnected from a peer:', id)
    });
  }

  broadcast(message) {
    const peers = Object.values(this.peers);
    peers.forEach((peer) => {
      peer.send(message); 
    });
  }
}

const swarmer = new Swarm();

setInterval(() => {
  swarmer.broadcast(faker.random.words(5));
}, 1000);

module.exports = Swarm;