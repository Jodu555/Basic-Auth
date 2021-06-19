const Joi = require('joi');

const userRegisterSchema = Joi.object({
	username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().alphanum().min(8).max(50).required(),
    email: Joi.string().email().required(),
});


module.exports = {
    userRegisterSchema,
};