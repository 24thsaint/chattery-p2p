const swarmlog = require('swarmlog');
const keys = require('./keys.json');
const sodium = require('sodium');
const wrtc = require('wrtc');
const level = require('level');
const faker = require('faker');

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

		this.stream = this.log.createReadStream({
			live: true
		});
		this.stream.on('data', (data) => {
			console.log(data);
		});
	}

	append(data) {
		this.log.append(data);
	}
}

const server = new Server();
setInterval(() => {
	server.append({
		hotel: 'RICHMONDE HOTEL',
		roomType: faker.random.word(1),
		price: faker.random.number({
			min: 100,
			max: 5000
		})
	});
}, 1000);

module.exports = server;