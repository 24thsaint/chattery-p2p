const swarmlog = require('swarmlog');
const keys = require('./keys.json');
const sodium = require('chloride/browser');
const wrtc = require('wrtc');
const level = require('level');
const faker = require('faker');
const query = require('./query')

const verbose = process.env.VERBOSE || false;

class Server {
	constructor() {
		this.database = level('./server-database');
		this.log = swarmlog({
			keys,
			sodium,
			wrtc,
			db: this.database,
			valueEncoding: 'json',
			hubs: ['http://signalhub-router.herokuapp.com/'],
		});

		if (verbose) {
			this.stream = this.log.createReadStream({
				live: true
			});

			this.stream.on('data', (data) => {
				console.log(data);
			});
		}

		this.find = query.find.bind(this);
		this.findOne = query.findOne.bind(this);
	}

	append(data) {
		this.log.append(data);
	}

	book(query, room, callback) {
		this.findOne(query, (data) => {
			if (!data) {
				callback(data, {error: 'No Matching Entries'});
				return;
			}

			const roomIndex = data.availableRooms.indexOf(room);

			if (roomIndex < 0) {
				callback(data, {error: 'Room Not Found'});
				return;
			}

			data.availableRooms.splice(roomIndex, 1);
			data.availableRooms = data.availableRooms;
			data.appendedOn = new Date();
			this.append(data);
			callback(data);
		});
	}
}

module.exports = Server;