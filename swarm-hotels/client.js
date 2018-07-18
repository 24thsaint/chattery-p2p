const swarmlog = require('swarmlog');
const sodium = require('chloride/browser');
const level = require('level');
const wrtc = require('wrtc');
const publicKey = require('./keys.json').public;
const query = require('./query');

const verbose = process.env.VERBOSE || false;

class Client {
	constructor() {
		this.database = level('./client-database');
		this.log = swarmlog({
			publicKey,
			sodium,
			db: this.database,
			wrtc,
			valueEncoding: 'json',
			hubs: ['http://signalhub-router.herokuapp.com/'],
		});

		if (verbose) {
			this.log
				.createReadStream({
					live: true,
					tail: true
				})
				.on('data', (data) => {
					console.log(`${data.key} synced!`);
				});
		}

		this.find = query.find.bind(this);
		this.findOne = query.findOne.bind(this);	
	}
}

const client = new Client();
client.findOne({
	date: 'Wed Aug 29 2018'
}, (data) => {
	console.log(data);
});

module.exports = client;