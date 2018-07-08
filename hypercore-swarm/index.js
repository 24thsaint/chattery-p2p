const crypto = require('crypto');
const Swarm = require('discovery-swarm');
const faker = require('faker');
const colors = require('colors');

class Swarmer {
    constructor() {
        this.id = crypto.randomBytes(32).toString('hex');
        this.swarm = Swarm(this.config);
    }

    connect(channel, callback) {
        this.swarm.listen(process.env.PORT || 8000);
        this.swarm.join(channel);
        this.swarm.on('connection', (peer, connection) => {
            console.log(peer.remoteAddress);
            callback({
                address: peer.remoteAddress,
                port: 6000
            }); 
        })
    }

    get config() {
        return {
            id: this.id,
            tcp: true,
            utp: true
        }
    }
}

module.exports = Swarmer;