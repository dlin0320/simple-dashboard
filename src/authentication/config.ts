import {auth} from 'express-openid-connect';

const config = {
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  secret: process.env.SECRET,
  idpLogout: true,
  authRequired: false,
};

export const auth0 = auth(config);