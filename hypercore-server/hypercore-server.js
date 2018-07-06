const hypercore = require('hypercore');
const faker = require('faker');
const remoteFeed = hypercore('./messages', {valueEncoding: 'utf-8'});

remoteFeed.append('test');

var net = require('net')
var server = net.createServer(function (socket) {
  socket.pipe(remoteFeed.replicate()).pipe(socket)
})

remoteFeed.on('upload', (index, data) => {
  console.log(index, data.toString());
})

server.listen(7777);

setInterval(() => {
  remoteFeed.append(faker.random.words(5));
}, 1000);

remoteFeed.on('ready', () => {
  console.log(Buffer.from(remoteFeed.key).toString('hex'))
})