const hypercore = require('hypercore');
const localFeed = hypercore('./messages', '2621de13c958d61c7d7f652631e08b77de204082444534cc9fa94184fedb21c2', {valueEncoding: 'utf-8'});

var net = require('net')

var socket = net.connect({
    port: 7777,
    host: 'localhost'
});

socket.pipe(localFeed.replicate()).pipe(socket)

localFeed.on('sync', () => {
    console.log('feed synced!')
});

localFeed.on('download', (index, data) => {
    console.log(index, data.toString());
});

