import { ApolloError, AuthenticationError } from 'apollo-server-core';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import Debug from 'debug';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:mutation`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}
function sameSiteEnv() {
  if (process.env.NODE_ENV === 'development') {
    return 'none';
  }
  return 'strict';
}
function secureEnv() {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  return true;
}

export default async function refreshToken(req, res, dataSources) {
  console.log('datasources', dataSources);
  debug('starting refreshToken');
  const cookies = cookie.parse(req.headers.cookie || '');
  const verifyToken = cookies['refresh-token'] || '';
  debugInDevelopment('refreshToken', verifyToken);

  try {
    const { id } = jwt.verify(verifyToken, process.env.REFRESH_TOKEN_SECRET);

    // clear user cash
    dataSources.dataDB.user.cache.clear();

    const user = await dataSources.dataDB.user.findByPk(id);
    if (!user) {
      debugInDevelopment('refreshToken:user failed');
      throw new ApolloError('User not found', 'BAD_REQUEST');
    }
    if (user.refresh_token !== verifyToken) {
      debugInDevelopment('refreshToken:refresh_token failed', verifyToken);
      throw new ApolloError('Error token', 'BAD_REQUEST');
    }
    // Make a new token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Add the new token to the cookies
    const TokenCookie = cookie.serialize(
      'auth-token',
      token,
      { httpOnly: true, sameSite: sameSiteEnv(), secure: secureEnv() },
    );
    const refreshTokenCookie = cookie.serialize(
      'refresh-token',
      refreshToken,
      { httpOnly: true, sameSite: sameSiteEnv(), secure: secureEnv() },
    );

    res.setHeader('set-cookie', [TokenCookie, refreshTokenCookie]);
  } catch (err) {
    debug('Error', err);
    throw new AuthenticationError('Invalid refresh token');
  }
}
