const readline = require('readline');
const Server = require('./server');
const colors = require('colors');
const server = new Server();
let rl;

help();

function seed() {
	return new Promise((resolve, reject) => {
		const mockRoomIDs = [];

		for (let index = 1; index <= 100; index++) {
			mockRoomIDs.push('Room' + index);
		}

		for (let index = 1; index <= 60; index++) {
			const keyDate = new Date();
			keyDate.setDate(index);
			const data = {
				hotel: 'RICHMONDE HOTEL',
				date: keyDate.toDateString(),
				availableRooms: mockRoomIDs,
				appendedOn: new Date()
			};

			server.append(data);
			console.log(data);
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

function help() {
	console.log('*************************');
	console.log('Available commands:');
	console.log('/showAvailable - Show available rooms by hotel and date');
	console.log('/book - Book an available room');
	console.log('/seed - Run a seed to create many entries');
	console.log('/create - Create a new hotel');
	console.log('*************************');
}

async function prompt() {
	const command = await openPrompter('Command');

	switch (command) {
		case '/showAvailable':
		{
			const hotel = await openPrompter('Hotel');
			let date = await openPrompter('Date (Month/Day/Year)');
			date = new Date(date).toDateString();

			try {
				const data = await server.findOne({
					hotel,
					date
				});
				console.log(data);
			} catch(e) {
				console.log('*************************');
				console.log(colors.red(e.message));
				console.log('*************************');
			}
			break;
		}
		case '/book':
		{
			const hotel = await openPrompter('Hotel');
			let date = await openPrompter('Date (Month/Day/Year)');
			date = new Date(date).toDateString();
			const room = await openPrompter('Room');

			try {
				const data = await server.book({
					hotel,
					date,
				}, room);

				console.log(data);
				console.log('*************************');
				console.log(colors.green('Room successfully booked!'));
				console.log('*************************');
			} catch(e) {
				console.log('*************************');
				console.log(colors.red(e.message));
				console.log('*************************');
			}

			break;
		}
		case '/seed':
		{
			const response = await seed();
			console.log(response);
			break;
		}
		case '/create':
		{
			const hotel = await openPrompter('Hotel');
			let date = await openPrompter('Date (Month/Day/Year)');
			date = new Date(date).toDateString();
			const rooms = await openPrompter('Rooms (comma-separated)');

			const data = await server.createHotel(hotel, date, rooms);
			console.log(data);
			console.log('*************************');
			console.log(colors.green('Hotel Created!'));
			console.log('*************************');

			break;
		}
		case '/help':
		{
			help();
			break;
		}
		default:
		{
			console.log(colors.red('Invalid command'));
		}
	}

	prompt();
}

server.database.on('ready', () => {
	prompt();
})