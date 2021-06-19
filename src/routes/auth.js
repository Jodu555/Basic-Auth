const express = require('express');
const { jsonSuccess, jsonError } = require('../utils/jsonMessages');
const { userRegisterSchema } = require('../utils/schemas');
const router = express.Router();


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
        obj.user = user;
        res.json(obj);
    }
});

router.post('/login', (req, res) => {

});

module.exports = router;
