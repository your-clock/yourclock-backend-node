require('dotenv').config();
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const nodemailer = require('nodemailer')

var mailConfig;
if(process.env.NODE_ENV === "production"){
	const myOAuth2Client = new OAuth2(
		process.env.ID_EMAIL,
		process.env.SECRET_EMAIL
	)
	myOAuth2Client.setCredentials({
		refresh_token: process.env.TOKEN_EMAIL
	});
	const myAccessToken = myOAuth2Client.getAccessToken()
	mailConfig = {
		service: "gmail",
		secure: true,
		requireTLS: true,
		secured: true,
		auth: {
			type: "OAuth2",
			user: process.env.USER_EMAIL, //your gmail account you used to set the project up in google cloud console"
			clientId: process.env.ID_EMAIL,
			clientSecret: process.env.SECRET_EMAIL,
			refreshToken: process.env.TOKEN_EMAIL,
			accessToken: myAccessToken //access token variable we defined earlier
		}
	};
}else if(process.env.NODE_ENV === "development" || "test"){
	mailConfig = {
		host: process.env.host_email,
		port: process.env.port_email,
		requireTLS: true,
		secured: true,
		auth: {
			user: process.env.ethereal_user,
			pass: process.env.ethereal_pwd
		}
	};
}

const transporter = nodemailer.createTransport(mailConfig);

transporter.verify(function(error, success) {
	if (error) {
	  	console.log(error);
	} else {
	  	console.log("Server is ready to take our messages");
	}
});

module.exports = transporter
