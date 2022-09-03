import express from 'express';

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
};

export function errorHandler(
    err: CustomError, req: express.Request, 
    res: express.Response, next: express.NextFunction) {
  res.status(err.code);
  res.send(err.toString());
};

export class CustomError extends Error {
  code!: number;

  constructor(message: string, name: string, code: number) {
    super(message);
    this.name = name;
    this.code = code;
  };

  toString() { 
    return `[${this.code}], error: ${this.name}, message: ${this.message}`
  }
};

export const CLIENT_ERROR = new CustomError(
  'bad request', 'client error', 400);

export const SERVER_ERROR = new CustomError(
  'internal server error', 'server error', 500);

export const AUTH0_ERROR = new CustomError(
  'external service unavailable', 'auth0 error', 503);

export const UNKNONW_ERROR = new CustomError(
  'bad gateway', 'unknown error', 502);