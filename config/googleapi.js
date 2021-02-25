import { google } from 'googleapis';

function urlGoogle() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.HOST + '/api/auth/google/callback'
  );
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'profile',
      'email'
    ]
  })
}

module.exports = {
    "urlGoogle": urlGoogle
}