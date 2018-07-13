const swarm = require('webrtc-swarm');
const signalhub = require('signalhub');
const wrtc = require('wrtc');
const faker = require('faker');
const readline = require('readline');
const colors = require('colors');

class Chatter {
  constructor() {
    this.hub = signalhub('swarm-example', ['http://signalhub-router.herokuapp.com/']);
    this.peers = {};
    this.sw = swarm(this.hub, {
      wrtc: wrtc
    });
    this.user = faker.name.firstName();

    this.rl = undefined;
    this.initialize();
  }

  initialize() {
    console.log(colors.rainbow(`Welcome ${this.user}!`));
    console.log('Waiting for peers to join...');
    this.prompter();
    this.sw.on('peer', (peer, id) => {
      if (!this.peers[id]) {
        this.peers[id] = peer;

        peer.on('data', (data) => {
          const message = JSON.parse(data);
          this.printer(`[${colors.gray(message.timestamp)}] ${colors.cyan(message.sender)}: ${message.content}`);
        });

        this.printer(colors.bgGreen(`[${id}] has joined the chat!`), 7);
      }
    });

    this.sw.on('disconnect', (peer, id) => {
      if (this.peers[id]) {
        delete this.peers[id];
        this.printer(colors.bgRed(`[${id}] has left!`), 7);
      }
    });
  }

  broadcast(message) {
    readline.clearLine(process.stdout);
    this.rl.close();
    this.rl = undefined;
    readline.cursorTo(process.stdout, 0);

    const peers = Object.values(this.peers);
    peers.forEach((peer) => {
      peer.send(message);
    });

    this.prompter();
  }

  printer(message, margin) {
    readline.clearLine(process.stdout);
    this.rl.close();
    this.rl = undefined;
    readline.cursorTo(process.stdout, margin || 0);
    console.log(message);
    this.prompter();
  }

  prompter() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: colors.red(`${this.user} > `)
    });
    this.rl.prompt();

    this.rl.on('line', (line) => {
      if (line.startsWith('/name')) {
        const parsedInput = line.split(' ');
        this.user = parsedInput[1];
        if (!this.user) {
          this.user = faker.name.firstName();
        }
        this.printer(colors.bgGreen(`Name has been changed to ${this.user}`), 7);
        return;
      }

      switch (line) {
        case '/peers':
          {
            this.printer(Object.keys(this.peers));
            break;
          }
          case '/leave': {
            this.sw.close(() => {
              console.log(colors.bgGreen('Exit success'));
              process.exit(0);
            });
            break;
          }
        default:
          {
            const message = {
              timestamp: new Date().toISOString(),
              sender: this.user,
              content: line
            }
            this.broadcast(JSON.stringify(message));
          }
      }
    });
  }
}

const chatter = new Chatter();

module.exports = Chatter;