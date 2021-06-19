const express = require('express');
const { jsonSuccess, jsonError } = require('../utils/jsonMessages');
const { userRegisterSchema, userLoginSchema } = require('../utils/schemas');
const router = express.Router();

const mailValidationTokens = new Map();
mailValidationTokens.set('fhizdbigbnikjhgdhbnkihgdjngdok', "USERID")

router.get('/', (req, res) => {
	res.json(jsonSuccess('Auth-Router works just fine'));
});

router.post('/register', (req, res) => {
    const validation = userRegisterSchema.validate(req.body);
    if(validation.error) {
        res.json(jsonError(validation.error.details[0].message));
    } else {
        const obj = jsonSuccess('Registered');
        const user = validation.value
        //Add to Database

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
        //Check if username || email && password is correct from Database
        const obj = jsonSuccess('Logged In');
        const user = validation.value
        res.json(obj);
    }
});

router.get('/emailValidation/:token', (req, res) => {
    const token = req.params.token;
    res.json(jsonSuccess(token));
});

module.exports = router;
