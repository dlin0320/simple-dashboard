import {Router} from 'express';
import {setToken, newUser, resetPassword, userProfiles, changeName} from './controllers';
import {checkSession} from '../authentication/controllers';
import {session} from '../session/config';

export const userRoutes = Router();
userRoutes.use(session);
userRoutes.post('/signup', newUser);
userRoutes.get('/profile', checkSession, setToken, userProfiles);
userRoutes.patch('/password', checkSession, setToken, resetPassword);
userRoutes.patch('/name', checkSession, setToken, changeName);