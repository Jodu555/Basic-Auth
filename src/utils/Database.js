const mysql = require('mysql');
class Database {
	connection = null;
	constructor() {}

	connect() {
		this.connection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: '',
			database: 'basicAuth',
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

	getUser(search) {
        console.log('Search for user with ', search);
    }
}

module.exports = Database;
