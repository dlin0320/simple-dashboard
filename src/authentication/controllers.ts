import axios, {AxiosResponse} from 'axios';
import {RequestHandler} from 'express';
import qs from 'qs';
import {AUTH0_ERROR, getErrorMessage, UNKNONW_ERROR} from '../error/errors';
import {logger} from '../logger/logger';

export const status: RequestHandler = (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
};

export const checkSession: RequestHandler = (req, res, next) => {
  if(req.session.userId) {
    return next();
  } else return res.send('user not logger in');
};

export const authenticate: RequestHandler = (req, res, next) => {
  if(req.oidc.isAuthenticated()) {
    req.session.userId = req.oidc.user?.sub;
    return next();
  } else return res.redirect(`${process.env.BASE_URL}/login`);
};

export async function createUser(userEmail: String, userPassword: String) {
  const options = {
    method: 'POST',
    url: `${process.env.ISSUER_BASE_URL}/dbconnections/signup`,
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    data: {
      client_id: process.env.CLIENT_ID,
      email: userEmail,
      password: userPassword,
      connection: process.env.CONNECTION,
    },
  };
  return await axios.request(options).then((res) => {
    if(res.status === 200) return 'sign up complete';
    else {
      logger.debug(`[${res.status}], ${JSON.stringify(res.data)}`);
      return UNKNONW_ERROR;
    };
  }).catch((err) => {
    logger.error(getErrorMessage(err));
    return AUTH0_ERROR;
  });
};

export async function updateUser(id: string, token: string, data: object) {
  const options = {
    method: 'PATCH',
    url: `${process.env.ISSUER_BASE_URL}/api/v2/users/${id}`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'authorization': `bearer ${token}`
    },
    data: qs.stringify(data),
  };
  return await axios.request(options).then((res) => { 
    if(res.status === 200) return 'user updated';
    else {
      logger.debug(`[${res.status}], ${JSON.stringify(res.data)}`);
      return UNKNONW_ERROR;
    };
  }).catch((err) => {
    logger.error(getErrorMessage(err));
    return AUTH0_ERROR;
  });
};

export async function getUsers(token: string, page: number = 0) {
  const DEFAULT_PAGE_SIZE = 100;
  const options = {
    method: 'GET',
    url: `${process.env.ISSUER_BASE_URL}/api/v2/users` + 
         `?page=${page}&per_page=${DEFAULT_PAGE_SIZE}&include_totals=true` + 
         `&sort=created_at:1&fields=created_at,last_login,logins_count` + 
         `&include_fields=true`,
    headers: { 
      'content-type': 'application/json',
      'authorization': `bearer ${token}`
    }
  };
  return await axios.request(options).then((res: AxiosResponse) => {
    if(res.status === 200) return JSON.stringify(res.data);
    else {
      logger.debug(`[${res.status}], ${JSON.stringify(res.data)}`);
      return UNKNONW_ERROR;
    };
  }).catch((err) => {
    logger.error(getErrorMessage(err));
    return AUTH0_ERROR;
  });
};

export async function getToken() {
  const data = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.SECRET,
    audience: `${process.env.ISSUER_BASE_URL}/api/v2/`,
    grant_type: 'client_credentials'
  };
  const options = { 
    method: 'POST',
    url: `${process.env.ISSUER_BASE_URL}/oauth/token`,
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    data: qs.stringify(data)
  };
  try {
    const res = await axios.request(options);
    if(res.status === 200) return res.data.access_token;
    else {
      logger.debug(`[${res.status}], ${JSON.stringify(res.data)}`);
      return UNKNONW_ERROR;
    }
  } catch (error) {
    logger.error(getErrorMessage(error));
    return AUTH0_ERROR;
  };
};

export const token: RequestHandler = async (req, res, next) => {
  const resp = await getToken();
  res.send(resp.data.access_token);
}