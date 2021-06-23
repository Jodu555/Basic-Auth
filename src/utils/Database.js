const mysql = require('mysql');
class Database {
	connection = null;
	constructor() {}

	connect() {
		this.connection = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
		});
		this.connection.connect();
	}

	disconnect() {
		if (this.connection != null) {
			this.connection.end();
			this.connection = null;
		}
	}

	reconnect() {
		this.disconnect();
		this.connect();
	}

	createUser(user) {
		this.connection.query(
			'INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?)',
			[
				user.uuid,
				user.username,
				user.email,
				user.password,
				user.verified ? user.verified : 'false',
				user.verificationToken,
			],
			(error, results, fields) => {
				if (error) {
					this.reconnect();
					this.createUser(user);
				}
			}
		);
	}

	//TODO: Update Users function (to update multiple users)
	async updateUser(search, user) {
		try {
			this.removeKeyFromObject(user, 'uuid');

            if(!Object.keys(user).length > 0) {
                throw new Error('Invalid user update Object');
            }

			let uuid = '';
			if (!search.uuid) {
				const searchresult = await this.getUser(search);
				uuid = searchresult[0].UUID;
			} else {
				uuid = search.uuid;
			}

			user.update = true;

			let query = 'UPDATE accounts SET ';
			const part = this.queryPartGeneration(user);
			query += part.query;
			query += ' WHERE UUID = ?';

			const values = part.values;
			values.push(uuid);

			this.connection.query(query, values, (error, results, fields) => {
				if (error) {
					this.reconnect();
					this.updateUser(search, user);
				}
			});
			return await this.getUser({ uuid: uuid });
		} catch (error) {
            const errormsg = `User Update Failed: searchTerm: ${JSON.stringify(search)} Update: ${JSON.stringify(user)}  Error: ${error.message}`;
            throw new Error(errormsg); 
        }
	}

	async getUser(search) {
		let query = 'SELECT * FROM accounts WHERE ';
		const part = this.queryPartGeneration(search);
		query += part.query;
		const values = part.values;
		return new Promise(async (resolve, reject) => {
			await this.connection.query(
				query,
				values,
				async (error, results, fields) => {
					const data = [];
					if (error) {
						throw error;
						this.reconnect();
						this.getUser(search);
					}
					await results.forEach((result) => {
						data.push(result);
					});
					resolve(data);
				}
			);
		});
	}

	queryPartGeneration(object) {
		let query = '';
		let delimiter = !object.unique ? (!object.unique ? 'OR' : 'AND') : 'AND';
		delimiter = object.update ? ',' : delimiter;
		this.removeKeyFromObject(object, 'unique');
		this.removeKeyFromObject(object, 'update');

		const keys = Object.keys(object);
		let values = [];
		let i = 0;
		keys.forEach((key) => {
			i++;
			values.push(object[key]);
			query += key + ' = ?';
			if (i < keys.length) query += ` ${delimiter} `;
		});
		return {
			values,
			query,
		};
	}

	removeKeyFromObject(obj, removeKey) {
		const keys = Object.keys(obj);
		keys.forEach((key) => {
			if (key.toLowerCase() == removeKey.toLowerCase()) {
				delete obj[key];
			}
		});
	}
}

module.exports = Database;
