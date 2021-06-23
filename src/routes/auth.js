const express = require('express');
const { jsonSuccess, jsonError } = require('../utils/jsonMessages');
const { userRegisterSchema, userLoginSchema } = require('../utils/schemas');
const { sendVerificationMessage } = require('../utils/mailer')
const { v4 } = require('uuid');
const router = express.Router();
let database;

const mailValidationTokens = new Map();

function setDatabase(_database) {
    database = _database;
}

router.get('/', (req, res) => {
	res.json(jsonSuccess('Auth-Router works just fine'));
});

router.post('/register', (req, res) => {
    const validation = userRegisterSchema.validate(req.body);
    if(validation.error) {
        res.json(jsonError(validation.error.details[0].message));
    } else {
        //TODO: Check if username and email is unique
        const obj = jsonSuccess('Registered');
        const user = validation.value
        const token = generateVerificationToken();
        
        user.verificationToken = token;
        user.uuid = v4();
        database.createUser(user);
        sendVerificationMessage(user.username, user.email, token);


        delete user.password;
        obj.user = user;
        res.json(obj);
    }
});

router.post('/login', (req, res) => {
    const validation = userLoginSchema.validate(req.body);
    if(validation.error) {
        res.json(jsonError(validation.error.details[0].message));
    } else {
        //TODO: Check if username || email && password is correct from Database
        const obj = jsonSuccess('Logged In');
        const user = validation.value
        res.json(obj);
    }
});

router.get('/emailValidation/:token', async (req, res) => {
    const token = req.params.token;
    const result = await database.getUser({
        unique: true,
        verificationToken: token,
        verified: 'false',
    });
    if(result.length > 0) {
        const user = await database.updateUser({uuid: result[0].UUID}, {verified: 'true', verificationToken: ''});
        const response = jsonSuccess('Valid Token! Account verified!');
        response.user = user[0];
        delete response.user.password;
        res.json(response);
    } else {
        res.json(jsonError('Invalid Token please Try Again!'));
    }
    
});

function generateVerificationToken() {
    let token = '';
    for (let i = 0; i < 7; i++) {
        token += v4();
    }
    token = token.split('-').join('');
    return token;
}

module.exports = {
    router,
    setDatabase
};
