import {RequestHandler} from 'express';
import {getToken, createUser, updateUser, getUsers} from '../authentication/controllers';
import {memClient} from '../storage/cache';
import {getErrorMessage, SERVER_ERROR} from '../error/errors';
import validator from 'password-validator';
import isEmail from 'validator/lib/isEmail';
import {logger} from '../logger/logger';

export const newUser: RequestHandler = async (req, res, next) => {
  const {email, password} = req.body;
  if(isEmail(email) && validPassword(password)) {
    await createUser(email, password).then((resOrError) => {
      if(typeof resOrError === 'string') return res.send(resOrError);
      else return next(resOrError);
    }).catch((err) => {
      logger.error(getErrorMessage(err));
      return next(SERVER_ERROR);
    });
  } else return res.send('please enter a valid email and/or password');
};

export const resetPassword: RequestHandler = async (req, res, next) => {
  const {password} = req.body;
  if(validPassword(password)) {
    const data = {password: password};
    await updateUser(req.session.userId!, req.body.token!, data)
      .then((resOrError) => {
        if(typeof resOrError === 'string') return res.send(resOrError);
        else return next(resOrError);
      })
      .catch((err) => {
        logger.error(getErrorMessage(err));
        return next(SERVER_ERROR);
      });
  } else return res.send('please enter a valid password');
};

export const changeName: RequestHandler = async (req, res, next) => {
  const {name} = req.body;
  const data = {name: name};
  await updateUser(req.session.userId!, req.body.token!, data)
    .then((resOrError) => {
      if(typeof resOrError === 'string') return res.send(resOrError);
      else return next(resOrError);
    })
    .catch((err) => {
      logger.error(getErrorMessage(err));
      return next(SERVER_ERROR);
    });
};

export function updateLastSession(date: Date, id: string, token: string) {
  const data = {user_metadata: {last_session: date}};
  updateUser(id, token, data);
};

export const userProfiles: RequestHandler = async (req, res, next) => {
  const cachedList = await memClient.get(req.session.userId!).then((res) => {
    return res.value?.toString();
  });
  const users = cachedList? cachedList : await getUsers(req.body.token!);
  if(typeof users === 'string' && users) return res.send(users);
  return next(users); 
};

export const setToken: RequestHandler = (req, _, next) => {
  getToken()
    .then((tokenOrError) => { 
      if(typeof tokenOrError === 'string') {
        req.body.token = tokenOrError;
        return next();
      }
      else return next(tokenOrError);
    })
    .catch((err) => {
      logger.error(getErrorMessage(err));
      return next(SERVER_ERROR);
    });
};

function validPassword(input: string | undefined) {
  const schema = new validator();
  schema
    .is().min(8)
    .is().max(64)
    .has().digits(1)
    .has().lowercase(1)
    .has().uppercase(1)
    .usingPlugin(specialCharacter);
  if(input && schema.validate(input)) return true;
  else return false;
};

function specialCharacter(input: string) {
  const regex = /^(?=.*[\s!"#$%&'()*+,-./:;<=>?@\[\\\\\]^_`{|}~])/;
  if(regex.test(input)) return true;
  else return false;
};