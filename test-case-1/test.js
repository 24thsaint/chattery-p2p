const crypto = require('crypto');
const Swarm = require('discovery-swarm');
const defaults = require('dat-swarm-defaults');
const faker = require('faker');

const id = crypto.randomBytes(32).toString('hex');

const config = defaults({
    id,
    utp: true,
    tcp: true
});

const swarm = Swarm(config);

this.swarm.on('redundant-connection', (connection, peer) => {
    this.log(`Redundant connection detected, dropping ${peer.host}:${peer.port}...`);
});

this.swarm.on('peer', (peer) => {
    this.log(`Peer ${peer.id} discovered, connecting...`);
});

this.swarm.on('peer-rejected', (peerAddress, reason) => {
    this.log(`Peer ${peerAddress.host}:${peerAddress.port} rejected, reason: ${reason.reason}`);
});

this.swarm.on('connection', (connection, info) => {   
    connection.on('data', (data) => {
        console.log('Remote data: ' + data.toString());
    });

    setInterval(() => {
        connection.write(faker.random.words(4));
    }, 1000);
});