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
        this.swarm = Swarm(this.config);
        this.peers = {};
        this.name = faker.name.firstName();

        this.swarm.on('redundant-connection', (connection, peer) => {
            console.log(`Redundant connection detected, dropping ${peer.host}:${peer.port}...`);
        })
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
                default:
                    {
                        const peers = Object.values(this.peers);
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
        return defaults({
            id: this.id
        })
    }

    async _listen() {
        const availablePort = await getPort();
        console.log(`Listening on ${availablePort}:${this.id}`);
        this.swarm.listen(availablePort);
    }

    async connect(channel) {
        await this._listen();
        this.swarm.join(channel);
        this.swarm.on('connection', (connection, info) => {
            const peerId = info.id.toString();
            if (!this.peers[peerId]) {
                this.peers[peerId] = connection;

                console.log(colors.cyan(`[${new Date().toISOString()}] INFO: ${peerId.substring(0, 7)} has joined!`));

                readline.clearLine(process.stdout);
                this.rl.close();
                this.rl = undefined;

                this.prompt();
            }

            connection.on('data', (data) => {
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
chattery.connect('stacktrek');