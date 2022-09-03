import 'dotenv/config';
import express, {RequestHandler} from 'express';
import cors from 'cors';
import {errorHandler} from './error/errors';
import {auth0} from './authentication/config';
import {userRoutes} from './users/routes';
import {dashboardRoutes} from './dashboard/routes';
import {initSession} from './session/session';

const app = express();
const port = process.env.PORT || 8080;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cors());
app.use(auth0);
app.use(express.json());
app.get('/', (_, res) => {
  res.redirect(`${process.env.BASE_URL}/dashboard`);
});
app.use('/dashboard', dashboardRoutes);
app.use('/user', userRoutes);
app.use(errorHandler);

app.listen(port, async () => {
  await initSession();
  console.log(`Listening on port ${port}`);
});
