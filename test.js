function solve(inputs) {
    const drivers = inputs[0].trim().split(' ');
    const zones = inputs[1].trim().split(' ').map(zone => parseFloat(zone));
	const checkpointIndices = inputs[2].trim().split(' ').map(index => parseInt(index));
	
	const database = {};

	drivers.forEach((driver) => {
		database[driver] = {
			fuel: driver.charCodeAt(),
			finishedAt: -1
		}
	})

	for (let index = 0; index < zones.length; index++) {
		const zone = zones[index];
		drivers.forEach((driver) => {
			if (database[driver].fuel <= 0) {
				return;
			}
			if (checkpointIndices.includes(index)) {
				database[driver].fuel += zone;
			} else {
				database[driver].fuel -= zone;
			}
			database[driver].finishedAt = index;
		})
	}

	Object.keys(database).forEach((key) => {
		const entry = database[key];

		if (entry.fuel > 0) {
			console.log(`${key} - fuel left ${entry.fuel.toFixed(2)}`);
		} else {
			console.log(`${key} - reached ${entry.finishedAt}`);
		}
	})
}

solve(['Garry Clark Larry',
	'4 5 12 0 8 7 13 22 5.5 26',
	'0 3 5 8']);

console.log('==========================')

solve(['Garry Clark',
	'69 1 15 5',
	'1 2'])