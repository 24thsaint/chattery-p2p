const hypercore = require('hypercore');
const faker = require('faker');
const Swarmer = require('../hypercore-swarm/index');

const remoteFeed = hypercore('./messages', 'ce8e397a26cbfe5b75579a0f92617d6a16db7c6eacdfad21ea876b6284cc4975', {
  createIfMissing: false, // create a new hypercore key pair if none was present in storage
  overwrite: false, // overwrite any old hypercore that might already exist
  valueEncoding: 'utf-8', // defaults to binary
  storeSecretKey: true, // if false, will not save the secret key
});

const swarmer = new Swarmer();

remoteFeed.append('test');

var net = require('net')

var server = net.createServer(function (socket) {
  socket.pipe(remoteFeed.replicate({
    live: true,
    download: true,
    encrypt: true
  })).pipe(socket)
  socket.on('error', (err) => {
    console.log('server error', err)
  })
})

server.listen(6000);

remoteFeed.on('ready', () => {
  console.log(remoteFeed.key.toString('hex'))
  console.log(remoteFeed.discoveryKey.toString('hex'))

  const key = remoteFeed.discoveryKey.toString('hex');
  swarmer.connect(key, (peer) => {
    console.log(`Connected to ${peer.address}:${peer.port}`)
  });

  remoteFeed.on('upload', (index, data) => {
    console.log(index, data.toString());
  });

  remoteFeed.on('error', (err) => {
    console.log('something went wrong', err)
  });
  
  remoteFeed.on('append', () => {
    console.log('Feed appended!');
  });
  
  setInterval(() => {
    const words = faker.random.words(5);
    console.log('Appended: ' + words);
    remoteFeed.append(words);
  }, 1000);
});