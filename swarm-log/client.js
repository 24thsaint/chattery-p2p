const swarmlog = require('swarmlog');
const sodium = require('chloride/browser');
const level = require('level');
const wrtc = require('wrtc');
const publicKey = require('./keys.json').public;

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
	}

	find(query, callback) {
		const response = [];
		const reader = this.log.createReadStream({
			live: false,
			keys: false
		});

		reader
			.on('data', function (data) {
				const value = data.value;
				const queryKeys = Object.keys(query);
				const partialObject = {};

				for (let index = 0, size = queryKeys.length; index < size; index++) {
					const key = queryKeys[index];
					partialObject[key] = value[key];
				}

				if (JSON.stringify(query) === JSON.stringify(partialObject)) {
					response.push(value);
				}
			})
			.on('error', function (err) {
				console.log('Error: ' + err);
			})
			.on('close', function () {
				console.log('Stream closed');
			})
			.on('end', function () {
				callback(response);
			});
	}
}

const client = new Client();
client.find({
	hotel: 'RICHMONDE HOTEL',
	roomType: 'Small'
}, (data) => {
	console.log(data);
});

module.exports = client;