const crypto = require('crypto')
const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const readline = require('readline')
const faker = require('faker');
const colors = require('colors');
const getPort = require('get-port');

let rl;

class Chattery {
    constructor() {
        this.id = crypto.randomBytes(32).toString('hex');
        this.rl = undefined;
        this.channel = undefined;
        this.swarm = Swarm(this.config);
        this.peers = {};
        this.name = faker.name.firstName();
        this.debug = false;
        this.port = process.env.PORT || 8080;

        this.swarm.on('redundant-connection', (connection, peer) => {
            this.log(`Redundant connection detected, dropping ${peer.host}:${peer.port}...`);
        });

        this.swarm.on('peer', (peer) => {
            this.log(`Peer ${peer.id} discovered, connecting...`);
        });

        this.swarm.on('peer-rejected', (peerAddress, reason) => {
            this.log(`Peer ${peerAddress.host}:${peerAddress.port} rejected, reason: ${reason.reason}`);
        });
    }

    log(message) {
        if (this.debug) {
            readline.clearLine(process.stdout);
            this.rl.close();
            this.rl = undefined;
            console.log(message);
            this.prompt();
        }
    }

    prompt() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: colors.red(`${this.name} > `)
        });

        this.rl.prompt();

        this.rl.on('line', (line) => {
            readline.clearLine(process.stdout);
            switch (line) {
                case '/peers':
                    {
                        console.log(this.peers);
                        break;
                    }
                case '/leave':
                    {
                        this.swarm.leave(this.channel);
                        console.log('Exit success');
                        process.exit(0);
                        break;
                    }
                case '/info':
                    {
                        console.log(`Queued: ${this.swarm.queued}`);
                        console.log(`Connecting: ${this.swarm.connecting}`);
                        console.log(`Connected: ${this.swarm.connected}`);
                        break;
                    }
                case '/debug':
                    {
                        this.debug = !this.debug;
                        console.log(`Debugging mode set to ${this.debug}`);
                        break;
                    }
                default:
                    {
                        const peers = Object.keys(this.peers).map(peer => this.peers[peer]);
                        const message = {
                            timestamp: new Date().toISOString(),
                            content: line,
                            sender: this.name
                        }
                        peers.forEach((peer) => {
                            peer.write(JSON.stringify(message));
                        });
                    }
            }
            readline.clearLine(process.stdout);
            this.rl.close();
            this.rl = undefined;

            this.prompt();
        })
    }

    get config() {
        // return defaults({
        //     id: this.id,
        //     utp: true,
        //     tcp: true
        // })
        return {
            id: this.id,
            utp: true,
            tcp: true
        }
    }

    _listen() {
        // const availablePort = await getPort({
        //     port: process.env.PORT
        // });
        console.log(`Listening on ${this.port}:${this.id}`);
        this.swarm.listen(this.port);
    }

    addPeer(peerId, connection) {
        if (!this.peers[peerId]) {
            this.peers[peerId] = connection;

            console.log(colors.cyan(`[${new Date().toISOString()}] INFO: ${peerId.substring(0, 7)} has joined!`));

            readline.clearLine(process.stdout);
            this.rl.close();
            this.rl = undefined;

            this.prompt();
        }
    }

    connect(channel) {
        this.channel = channel;
        this._listen();
        this.swarm.join(channel);
        this.swarm.on('connection', (connection, info) => {
            const peerId = info.id.toString();
            this.addPeer(peerId, connection);
            
            connection.on('data', (data) => {
                this.addPeer(peerId, connection);

                readline.clearLine(process.stdout);
                this.rl.close();
                this.rl = undefined;
                const message = JSON.parse(data);
                console.log(`[${colors.gray(message.timestamp)}] ${colors.green(message.sender)}: ${message.content}`);
                this.prompt();
            });

            connection.on('close', () => {
                if (this.peers[peerId]) {
                    delete this.peers[peerId];
                    readline.clearLine(process.stdout);
                    this.rl.close();
                    this.rl = undefined;
                    console.log(colors.cyan(`[${new Date().toISOString()}] INFO: ${peerId.substring(0, 7)} has disconnected!`));
                    this.prompt();
                }
            });
        });

        this.prompt();
    }
}

const chattery = new Chattery();
chattery.connect('kingsland-5');