import {RequestHandler} from 'express';

export const dashboard: RequestHandler = async (req, res) => {
  const appSession = req.cookies;
  res.render('dashboard', {appSession: appSession});
};