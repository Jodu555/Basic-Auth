const mysql = require('mysql');
const thingDatabase = require('./thingDatabase')
class Database {
	connection = null;

	constructor() { }

	connect() {
		this.connection = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
		});
		this.connection.connect();
		this.connection.on('error', (error) => {
			console.log('Database error', error);
			if (error.code === 'PROTOCOL_CONNECTION_LOST') {
				console.log('Database connection Failed!');
				console.log('Attempting to reconnect...');
				this.reconnect();
			} else {
				throw error;
			}
		});

		//Setup all databases here
		this.authDatabase = new thingDatabase('accounts', 'Auth', this, this.connection);
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

	get getAuth() {
		return this.authDatabase;
	}
}

module.exports = Database;
