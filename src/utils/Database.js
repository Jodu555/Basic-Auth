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

	updateUser(user) {}

	async getUser(search) {
        const delimiter = search.unique ? search.unique ? 'OR' : 'AND' : 'AND';
        delete search.unique;
		let query = 'SELECT * FROM accounts WHERE ';
		const keys = Object.keys(search);
		let values = [];
		let i = 0;
		keys.forEach((key) => {
			i++;
			values.push(search[key]);
			query += key + ' = ?';
			if (i < keys.length) query += ` ${delimiter} `;
		});
        return new Promise(async (resolve, reject) => {
            await this.connection.query(query, values, async (error, results, fields)  => {
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
            });
        })
		
	}
}

module.exports = Database;
