const crypto = require('crypto');
const Swarm = require('discovery-swarm');
const defaults = require('dat-swarm-defaults');
const faker = require('faker');

const id = crypto.randomBytes(32).toString('hex');

const config = defaults({
    id,
    tcp: true,
});

const swarm = Swarm(config);

swarm.on('redundant-connection', (connection, peer) => {
    console.log(`Redundant connection detected, dropping ${peer.host}:${peer.port}...`);
});

swarm.on('peer', (peer) => {
    console.log(`Peer ${peer.id} discovered, connecting...`);
});

swarm.on('peer-rejected', (peerAddress, reason) => {
    console.log(`Peer ${peerAddress.host}:${peerAddress.port} rejected, reason: ${reason.reason}`);
});



swarm.on('connection', (connection, info) => {   
    connection.write('test!');

    connection.on('data', (data) => {
        console.log('Remote data: ' + data.toString());
        const message = faker.random.words(4);
        connection.write(message);
    });
});

swarm.listen(process.env.PORT || 8088);
swarm.join('rave-8088-test-case-1');