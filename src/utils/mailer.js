const nodemailer = require('nodemailer');

const sendVerificationMessage = (username, reviever, token) => {
	const transporter = nodemailer.createTransport({
		pool: true,
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		secure: true, // use TLS
		auth: {
			user: process.env.MAIL_USERNAME,
			pass: process.env.MAIL_PASSWORD,
		},
	});

    const link = process.env.URL + '/auth/emailValidation/' + token;

	const message = {
		from: process.env.MAIL_FROM,
		to: reviever,
		subject: 'E-Mail Verification',
		text: `Hello ${username}

        You registered an account on our App, before being able to use your account you need to verify that this is your email address by clicking here: ${link}
        
        Kind Regards, Your App Team`,
	};
    transporter.sendMail(message);
};

module.exports = {
	sendVerificationMessage,
};
