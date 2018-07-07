const hypercore = require('hypercore');
const Swarm = require('../hypercore-swarm/index');
const feedId = '2621de13c958d61c7d7f652631e08b77de204082444534cc9fa94184fedb21c2';
const localFeed = hypercore('./messages', feedId, {
    valueEncoding: 'utf-8'
});
var net = require('net');

const swarm = new Swarm();
swarm.connect(feedId, (peer) => {
    var socket = net.connect({
        port: 8080,
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