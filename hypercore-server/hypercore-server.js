const hypercore = require('hypercore');
const faker = require('faker');
const Swarmer = require('../hypercore-swarm/index');
const remoteFeed = hypercore('./messages', {
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

server.listen(7777);

remoteFeed.on('ready', () => {
  const key = Buffer.from(remoteFeed.key).toString('hex');
  console.log(key);
  swarmer.connect(key, (peer) => {
    console.log(`Connected to ${peer.address}:${peer.port}`)
  });

  setInterval(() => {
    remoteFeed.append(faker.random.words(5));
  }, 1000);
})

remoteFeed.on('error', (err) => {
  console.log('something went wrong', err)
});