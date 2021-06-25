const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { router: auth, setDatabase: auth_setDatabase } = require('./routes/auth');
const { jsonSuccess, jsonError } = require('./utils/jsonMessages');
const dotenv = require('dotenv').config();
const Database = require('./database/Database');

const database = new Database();
database.connect();

auth_setDatabase(database);

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use(helmet());
app.use(express.json());

app.use('/auth', authentication, auth);

app.get('/', (req, res) => {
	res.json(jsonSuccess('Basic Auth API works just fine!'));
});

function authentication(req, res, next) {
	const token = req.headers['auth-token'];
	if(token) {
		if(token == token) {
			console.log(token);
			req.credentials = {
				token,
				user: {
					name: 'test'
				}
			};
			next();
		} else {
			res.status(401).json(jsonError('Invalid auth-token'))
		}
	} else {
		res.status(401).json(jsonError('Missing auth-token in headers'))
	}
	
}

const PORT = process.env.PORT || 3100;
app.listen(PORT, async () => {
	console.log(`Express App Listening on ${PORT}`);

});
