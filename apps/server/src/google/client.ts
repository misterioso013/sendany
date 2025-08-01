import "dotenv/config"
import { google } from "googleapis";
import { Credentials, OAuth2Client } from 'google-auth-library';

export const oauth2Client: OAuth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
})

export function createClientWithCredentials(tokens: Credentials): OAuth2Client {
  const client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI!,
  });

  client.setCredentials(tokens);
  return client;
}
