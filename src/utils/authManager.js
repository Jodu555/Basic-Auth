const { jsonSuccess, jsonError } = require('./jsonMessages');

const tokens = new Map();

function addToken(token, user) {
	tokens.forEach((value, key) => {
        if(JSON.stringify(value) == JSON.stringify(user)) {
            tokens.delete(key);
        }
	});
	tokens.set(token, user);
}

function getUser(token) {
	return tokens.get(token);
}

function authentication(req, res, next) {
	const token = req.headers['auth-token'];
	if (token) {
		if (getUser(token)) {
			req.credentials = {
				token,
				user: getUser(token),
			};
			next();
		} else {
			res.status(401).json(jsonError('Invalid auth-token'));
		}
	} else {
		res.status(401).json(jsonError('Missing auth-token in headers'));
	}
}

module.exports = {
	addToken,
	getUser,
	authentication,
};
