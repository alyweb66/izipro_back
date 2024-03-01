import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import Debug from 'debug';
import { ApolloError, AuthenticationError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:getUserByToken`);

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

export default async function getUserByToken(req, res, dataSources) {
  debug('starting get user by token');

  const cookies = cookie.parse(req.headers.cookie || '');
  debugInDevelopment('cookies', cookies);

  const token = cookies['auth-token'] || '';
  console.log('token', token);
  const refreshToken = cookies['refresh-token'] || '';

  try {
    if (token) {
      const userData = jwt.verify(token, process.env.JWT_SECRET);

      debugInDevelopment('userData', userData);
      return userData;
    }
  } catch (tokenError) {
    debug('Failed to verify token', tokenError);
    if (tokenError instanceof jwt.TokenExpiredError) {
      // If the error is token expired, i refresh the token
      debug('refreshToken is starting');
      try {
        const verifyRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!verifyRefreshToken) {
          debugInDevelopment('refreshToken:verifyRefreshToken failed');
          throw new ApolloError('Error token', 'BAD_REQUEST');
        }

        // clear user cash
        dataSources.dataDB.user.cache.clear();

        const user = await dataSources.dataDB.user.findByPk(verifyRefreshToken.id);
        console.log('user', user);
        if (!user) {
          debugInDevelopment('refreshToken:user failed');
          throw new ApolloError('User not found', 'BAD_REQUEST');
        }
        if (user.refresh_token !== refreshToken) {
          debugInDevelopment('refreshToken:refresh_token failed', verifyRefreshToken);
          throw new ApolloError('Error token', 'BAD_REQUEST');
        }
        const newToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1m' });
        // Add the new token to the cookies
        const TokenCookie = cookie.serialize(
          'auth-token',
          newToken,
          { httpOnly: true, sameSite: sameSiteEnv(), secure: secureEnv() },
        );
        const refreshTokenCookie = cookie.serialize(
          'refresh-token',
          refreshToken,
          { httpOnly: true, sameSite: sameSiteEnv(), secure: secureEnv() },
        );

        res.setHeader('set-cookie', [TokenCookie, refreshTokenCookie]);
        const userData = { id: user.id, role: user.role };
        return userData;
      } catch (refreshTokenError) {
        // If the error is token expired, i clear the cookies
        if (refreshTokenError instanceof jwt.TokenExpiredError) {
          debug('user is logged out ');
          const pastDate = new Date(0);
          const TokenCookie = cookie.serialize(
            'auth-token',
            '',
            {
              httpOnly: true, sameSite: sameSiteEnv(), secure: secureEnv(), expires: pastDate,
            },
          );
          const refreshTokenCookie = cookie.serialize(
            'refresh-token',
            '',
            {
              httpOnly: true, sameSite: sameSiteEnv(), secure: secureEnv(), expires: pastDate,
            },
          );

          res.setHeader('set-cookie', [TokenCookie, refreshTokenCookie]);
          const userData = null;
          return userData;
        }
        debug('Failed to verify refresh token', refreshTokenError);
        throw new ApolloError('refresh token expired', 'BAD_REQUEST');
      }
    }
  }
  throw new AuthenticationError('Failed to verify token');
}
