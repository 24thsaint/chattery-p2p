const hypercore = require('hypercore');
const Swarm = require('../hypercore-swarm/index');
var net = require('net');

const feedId = 'ce8e397a26cbfe5b75579a0f92617d6a16db7c6eacdfad21ea876b6284cc4975';
const feedDiscoveryKey = '60f3312798ddb2cc734a1acaf9928f91f76b46fb48b04175726fc68fdffb28a2';

const localFeed = hypercore('./messages', feedId, {
    valueEncoding: 'utf-8'
});

const swarm = new Swarm();
swarm.connect(feedDiscoveryKey, (peer) => {
    var socket = net.connect({
        port: 6000,
        host: peer.address
    });

    socket.pipe(localFeed.replicate({
        live: true,
        download: true,
        encrypt: true
    })).pipe(socket)

    localFeed.on('sync', () => {
        console.log('feed synced!')
    });

    localFeed.on('download', (index, data) => {
        console.log(index, data.toString());
    });
    
    socket.on('error', () => {
        console.log(`Failed to connect to ${peer.address}:${peer.port}`);
    })
    
    localFeed.on('error', () => {
        console.log(`Failed to connect to ${peer.address}:${peer.port}`);
    })
});