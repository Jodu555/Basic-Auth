const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { router: auth, setDatabase: auth_setDatabase } = require('./routes/auth');
const { jsonSuccess, jsonError } = require('./utils/jsonMessages');
const dotenv = require('dotenv').config();
const Database = require('./utils/Database');

const database = new Database();
database.connect();

auth_setDatabase(database);

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use(helmet());
app.use(express.json());

app.use('/auth', auth);

app.get('/', (req, res) => {
	res.json(jsonSuccess('Basic Auth API works just fine!'));
});

const PORT = process.env.PORT || 3100;
app.listen(PORT, async () => {
	console.log(`Express App Listening on ${PORT}`);

    // console.log(await database.getUser({unique: true, username: 'Test', email: 'Jodu505@gmail.com'}));
    // console.log(await database.getUser({UUID: 'eaf30e69-1214-47e6-b37e-6838eb2bd813'}));

    // const res = await database.updateUser({username: 'Test'}, {UUID: 'null'});
    // console.log(res);
});
