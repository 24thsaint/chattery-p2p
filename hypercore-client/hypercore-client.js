const hypercore = require('hypercore');
const Swarm = require('../hypercore-swarm/index');
var net = require('net');

const feedId = '2621de13c958d61c7d7f652631e08b77de204082444534cc9fa94184fedb21c2';
const feedDiscoveryKey = '88eccb72ae4fdffd2954612bf0d2ae90c5f4acf6ef816944455beaccf60d0cbd';

const localFeed = hypercore('./messages', feedId, {
    valueEncoding: 'utf-8'
});

const swarm = new Swarm();
swarm.connect(feedDiscoveryKey, (peer) => {
    var socket = net.connect({
        port: peer.port,
        host: peer.address
    });

    socket.pipe(localFeed.replicate()).pipe(socket)

    localFeed.on('sync', () => {
        console.log('feed synced!')
    });

    localFeed.on('download', (index, data) => {
        console.log(index, data.toString());
    });
});