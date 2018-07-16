const swarmlog = require('swarmlog');
const keys = require('./keys.json');
const sodium = require('chloride/browser');
const wrtc = require('wrtc');
const level = require('level');
const faker = require('faker');
const readline = require('readline');
const colors = require('colors');

class Server {
    constructor() {
        this.database = level('./chat-database');
        this.log = swarmlog({
            keys,
            sodium,
            wrtc,
            db: this.database,
            valueEncoding: 'json',
            hubs: ['http://signalhub-router.herokuapp.com/'],
        });

        this.stream = this.log.createReadStream({
            live: true
        });

        this.stream.on('data', (data) => {
            const message = JSON.parse(data.value);
            this.printer(`[${colors.gray(message.timestamp)}] ${colors.cyan(message.sender)}: ${message.content}`);
        });

        this.log.swarm.on('peer', (peer, id) => {
            this.printer(colors.bgCyan(`[${new Date().toISOString()}] ${id} has joined!`), 7);
        })

        this.log.swarm.on('disconnect', (peer, id) => {
            this.printer(colors.bgCyan(`[${new Date().toISOString()}] ${id} has disconnected!`), 7);
        })

        this.user = faker.name.firstName();
        this.rl = undefined;
        this.prompter();
    }

    append(data) {
        this.log.append(data);
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
                case '/leave':
                    {
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
                        this.append(JSON.stringify(message));
                    }
            }
        });
    }
}

const server = new Server();

module.exports = server;