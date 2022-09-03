import Session from 'express-session';
import SequelizeStore from 'connect-session-sequelize';
import {sequelize} from '../storage/db';
import {v4 as uuidv4} from 'uuid';

declare module 'express-session' {
  export interface SessionData {
    userId: string;
    token: string;
  }
}

const store = SequelizeStore(Session.Store);

export const session = Session({
  secret: 'we7hLDvjNKiGGapNZopJ',
  store: new store({
    db: sequelize,
    expiration: 1000 * 60 * 60 * 24
  }),
  saveUninitialized: false,
  resave: true,
  genid: () => uuidv4()
});