import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:getUserByToken`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

export default function getUserByToken(req) {
  debug('starting get user by token');

  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    debugInDevelopment('cookies', cookies);

    const token = cookies['auth-token'] || '';

    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userData = decodedToken;
      debugInDevelopment('userData', userData);
      return userData;
    }
  } catch (err) {
    debug('Failed to verify token', err);
    if (err instanceof jwt.TokenExpiredError) {
      return null;
    }
    throw new ApolloError('Failed to verify token', 'BAD_REQUEST');
  }
  return null;
}
