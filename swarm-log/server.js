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

	async book(query, room) {
		const data = await this.findOne(query);

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

		return data;
	}

	createHotel(hotel, date, rooms) {
		return new Promise((resolve, reject) => {
			const data = {
				hotel,
				date,
				rooms
			}
			if (typeof rooms === 'string') {
				const parsedRooms = rooms.split(',').map(room => room.trim());
				data.rooms = parsedRooms;
			}
			this.append(data);
			resolve(data);
		});
	}
}

module.exports = Server;