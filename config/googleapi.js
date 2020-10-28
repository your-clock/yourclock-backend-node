import { google } from 'googleapis';

function urlGoogle() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.HOST + '/api/auth/google/callback'
  );
  const url = auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'profile',
      'email'
    ]
  });
  return url;
}

module.exports = {
    "urlGoogle": urlGoogle
}