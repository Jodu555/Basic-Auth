const mysql = require('mysql');
const AuthDatabase = require('./authDatabase');
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
		this.authDatabase = new AuthDatabase(this.connection);
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
