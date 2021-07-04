const { queryPartGeneration, removeKeyFromObject } = require('./utils');
class thingDatabase {
	constructor(table_name, name, database, connection) {
		this.table_name = table_name;
		this.name = name;
		this.database = database;
		this.connection = connection;
		console.log(this.name + ' Database Initialized');
	}

	create(thing) {
		const len = Object.keys(thing).length;
		const values = [];
		let partsQuery = '(';
		let valueQuery = '(';
		let i = 0;
		Object.keys(thing).forEach((key) => {
			values.push(thing[key]);
			i++;
			valueQuery += '?';
			if (len != i) {
				valueQuery += ', ';
			}
			partsQuery += key;
			if (len != i) {
				partsQuery += ', ';
			}
		});
		valueQuery += ')';
		partsQuery += ')';
		let query = `INSERT INTO ${this.table_name} ${partsQuery} VALUES ${valueQuery}`;
		this.connection.query(query, values, (error, results, fields) => {
			if (error) {
				this.database.reconnect();
				this.create(thing);
			}
		});
	}

	//TODO: Update Things function (to update multiple thinghs)
	async update(search, thing) {
		try {
			removeKeyFromObject(thing, 'uuid');

			if (!Object.keys(thing).length > 0) {
				throw new Error('Invalid thing update Object');
			}

			let uuid = '';
			if (!search.uuid) {
				const searchresult = await this.get(search);
				uuid = searchresult[0].UUID;
			} else {
				uuid = search.uuid;
			}

			thing.update = true;

			let query = 'UPDATE ' + this.table_name + ' SET ';
			const part = queryPartGeneration(thing);
			query += part.query;
			query += ' WHERE UUID = ?';

			const values = part.values;
			values.push(uuid);

			this.connection.query(query, values, (error, results, fields) => {
				if (error) {
					this.database.reconnect();
					this.update(search, thing);
				}
			});
			return await this.get({ uuid: uuid });
		} catch (error) {
			const errormsg = `${this.name} Update Failed: searchTerm: ${JSON.stringify(
				search
			)} Update: ${JSON.stringify(thing)}  Error: ${error.message}`;
			throw new Error(errormsg);
		}
	}

	async get(search) {
		let query = 'SELECT * FROM ' + this.table_name + ' WHERE ';
		const part = queryPartGeneration(search);
		query += part.query;
		const values = part.values;

		if (Object.keys(search) == 0) {
			query = 'SELECT * FROM ' + this.table_name;
		}

		return new Promise(async (resolve, reject) => {
			await this.connection.query(query, values, async (error, results, fields) => {
				const data = [];
				if (error) {
					throw error;
					this.database.reconnect();
					this.get(search);
				}
				await results.forEach((result) => {
					data.push(result);
				});
				resolve(data);
			});
		});
	}

	async delete(search) {
		let query = 'DELETE FROM ' + this.table_name + ' WHERE ';
		const part = queryPartGeneration(search);
		query += part.query;
		const values = part.values;
		this.connection.query(query, values, (error, results, fields) => {
			if (error) {
				throw error;
				this.database.reconnect();
				this.delete(search);
			}
		});
	}
}

module.exports = thingDatabase;
