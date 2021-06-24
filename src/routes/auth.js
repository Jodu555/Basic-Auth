const express = require('express');
const { jsonSuccess, jsonError } = require('../utils/jsonMessages');
const { userRegisterSchema, userLoginSchema } = require('../database/schemas');
const { sendVerificationMessage } = require('../utils/mailer')
const { v4 } = require('uuid');
const router = express.Router();
let database;

const authTokens = new Map();

function setDatabase(_database) {
    database = _database;
}

router.get('/', (req, res) => {
	res.json(jsonSuccess('Auth-Router works just fine'));
});

router.post('/register', async (req, res) => {
    const validation = userRegisterSchema.validate(req.body);
    if(validation.error) {
        res.json(jsonError(validation.error.details[0].message));
    } else {
        const user = validation.value
        const search = {...user}; //Spreading to disable the reference
        delete search.password;
        search.unique = true;
        const result = await database.getAuth.getUser(search);

        if(result.length == 0) {
            const obj = jsonSuccess('Registered');
            const token = generateVerificationToken();
            user.verificationToken = token;
            user.uuid = v4();
            await database.getAuth.createUser(user);
            sendVerificationMessage(user.username, user.email, token);
    
            delete user.password;
            delete user.verificationToken;
            obj.user = user;
            res.json(obj);
        } else {
            res.json(jsonError('The email or the username is already taken!'));
        }
    }
});

router.post('/login', async (req, res) => {
    const validation = userLoginSchema.validate(req.body);
    if(validation.error) {
        res.json(jsonError(validation.error.details[0].message));
    } else {
        const user = validation.value;
        const result = await database.getAuth.getUser({...user, unique: true});
        if(result.length > 0) {
            res.json(jsonSuccess('Successfully logged In'));
            //TODO: send back an auth token
        } else {
            const value = user.username ? 'username' : 'email';
            res.json(jsonError('Invalid ' + value + ' and password'))
        }
    }
});

router.get('/emailValidation/:token', async (req, res) => {
    const token = req.params.token;
    const result = await database.getAuth.getUser({
        unique: true,
        verificationToken: token,
        verified: 'false',
    });
    if(result.length > 0) {
        const user = await database.getAuth.updateUser({uuid: result[0].UUID}, {verified: 'true', verificationToken: ''});
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
