const readline = require('readline');
const Server = require('./server');
const server = new Server();
let rl;

function create() {
	return new Promise((resolve, reject) => {
		const mockRoomIDs = [];

		for (let index = 1; index <= 100; index++) {
			mockRoomIDs.push('Room' + index);
		}

		for (let index = 1; index <= 60; index++) {
			const keyDate = new Date();
			keyDate.setDate(index);

			server.append({
				hotel: 'RICHMONDE HOTEL',
				date: keyDate.toDateString(),
				availableRooms: mockRoomIDs,
				appendedOn: new Date()
			});
		}

		resolve('CREATION DONE!');
	});
}

function openPrompter(message) {
	rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: message + '> '
	});

	rl.prompt();

	return new Promise((resolve, reject) => {
		rl.on('line', (line) => {
			closePrompter();
			resolve(line);
		});
		rl.on('error', (err) => {
			reject(err);
		});
	});
}

function closePrompter() {
	rl.close();
	rl = undefined;
}

async function prompt() {
	const command = await openPrompter('Command');

	switch (command) {
	case '/showAvailable':
	{
		const hotel = await openPrompter('Hotel');
		let date = await openPrompter('Date');
		date = new Date(date).toDateString();

		server.find({
			hotel,
			date
		}, (err, data) => {
			if (err) console.log(err);
			console.log(data);
		});
		break;
	}
	case '/book':
	{
		const hotel = await openPrompter('Hotel');
		let date = await openPrompter('Date');
		date = new Date(date).toDateString();
		const room = await openPrompter('Room');

		server.book({
			hotel,
			date,
		}, room, (dt, err) => {
			if (err) {
				console.log(err);
			} else {
				console.log(dt);
				console.log('*************************');
				console.log('Room successfully booked!');
				console.log('*************************');
			}
		});

		break;
	}
	case '/create':
	{
		const response = await create();
		console.log(response);
		break;
	}
	default:
	{
		console.log('Invalid command');
	}
	}

	prompt();
}

prompt();