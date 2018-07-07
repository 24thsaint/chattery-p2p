const hypercore = require('hypercore');
const faker = require('faker');
const Swarmer = require('../hypercore-swarm/index');
const remoteFeed = hypercore('./messages', '2621de13c958d61c7d7f652631e08b77de204082444534cc9fa94184fedb21c2', {
  valueEncoding: 'utf-8'
});

const swarmer = new Swarmer();

remoteFeed.append('test');

var net = require('net')

var server = net.createServer(function (socket) {
  socket.pipe(remoteFeed.replicate()).pipe(socket)
  socket.on('error', (err) => {
    console.log('server error', err)
  })
})

remoteFeed.on('upload', (index, data) => {
  console.log(index, data.toString());
})

setInterval(() => {
  const words = faker.random.words(5);
  console.log('Appended: ' + words);
  remoteFeed.append(words);
}, 1000);

server.listen(process.env.PORT || 8080);

remoteFeed.on('ready', () => {
  const key = Buffer.from(remoteFeed.key).toString('hex');
  console.log(key);
  swarmer.connect(key, (peer) => {
    console.log(`Connected to ${peer.address}:${peer.port}`)
  });
})

remoteFeed.on('error', (err) => {
  console.log('something went wrong', err)
});

remoteFeed.on('append', () => {
  console.log('Feed appended!');
})