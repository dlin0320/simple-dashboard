import {Router} from 'express';
import {dashboard} from './controllers';
import {authenticate} from '../authentication/controllers';

export const dashboardRoutes = Router();
dashboardRoutes.get('/', authenticate, dashboard);