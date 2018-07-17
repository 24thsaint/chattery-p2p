const query = {
	find: function (query, callback) {
		const response = [];
		const reader = this.log.createReadStream({
			live: false,
			keys: false
		});

		return new Promise((resolve, reject) => {
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
					reject('Error: ' + err);
				})
				.on('close', function () {
					reject('Stream closed');
				})
				.on('end', function () {
					resolve(response);
				});
		})
	},
	findOne: async function (query, callback) {
		const data = await this.find(query);
		return new Promise((resolve, reject) => {
			const sortedData = data.sort((a, b) => {
				const dateA = new Date(a.appendedOn);
				const dateB = new Date(b.appendedOn);
	
				if (dateA === dateB) {
					return 0;
				}
	
				return dateA < dateB ? 1 : -1;
			});
			resolve(sortedData[0]);
		});
	}
}

module.exports = query;