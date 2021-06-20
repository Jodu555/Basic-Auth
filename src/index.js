const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const auth = require('./routes/auth');
const { jsonSuccess, jsonError } = require('./utils/jsonMessages');
const dotenv = require('dotenv').config();

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use(helmet());
app.use(express.json());

app.use('/auth', auth)

app.get('/', (req, res) => {
    res.json(jsonSuccess('Basic Auth API works just fine!'))
});


const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
	console.log(`Express App Listening on ${PORT}`);
});
