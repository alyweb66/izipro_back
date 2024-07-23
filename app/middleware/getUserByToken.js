import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import Debug from 'debug';
import { ApolloError, AuthenticationError } from 'apollo-server-core';
import serverLogout from './serverLogout.js';
import pubsub from './pubSub.js';
import RefreshToken from '../datasources/data/datamappers/refreshToken.js';
// import User from '../datasources/data/datamappers/User.js';

const refreshTokenInstance = new RefreshToken();
// const UserMutation = new User();

const debug = Debug(`${process.env.DEBUG_MODULE}:getUserByToken`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

function secureEnv() {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  return true;
}

function subscribeToLogout(userId) {
  debugInDevelopment('subscribeToLogout', userId);
  const subValue = { id: userId, value: true };
  pubsub.publish('LOGOUT', {
    logout: subValue,
  });
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: secureEnv(),
  domain: 'localhost',
  path: '/',
};

export default async function getUserByToken(req, res, dataSources) {
  debug('starting get user by token');

  const cookies = cookie.parse(req.headers.cookie || '');
  debugInDevelopment('cookies', cookies);

  const token = cookies['auth-token'] || '';
  const refreshToken = cookies['refresh-token'] || '';
  let decodeToken;
  try {
    // If the token is valid, return the user data
    if (token) {
      const userData = jwt.verify(token, process.env.JWT_SECRET);

      debugInDevelopment('userData', userData);
      return userData;
    }
  } catch (tokenError) {
    debug('Failed to verify token', tokenError);

    if (tokenError instanceof jwt.TokenExpiredError) {
      // If the error is token expired, refresh the token
      debug('refreshToken is starting');

      try {
        // decode the refresh token to get the user id
        decodeToken = jwt.decode(refreshToken);
        // clear user cache
        dataSources.dataDB.user.cache.clear();
        const user = await refreshTokenInstance.getRefreshTokenByUserId(decodeToken.id);

        const verifyRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        if (!verifyRefreshToken) {
          debugInDevelopment('refreshToken: verifyRefreshToken failed');
          throw new ApolloError('Error token', 'BAD_REQUEST');
        }

        // If the user is not found, go to logout
        if (!user) {
          debugInDevelopment('refreshToken: user failed');
          subscribeToLogout(verifyRefreshToken.id);
          serverLogout(null, null, { res });
          throw new ApolloError('User not found', 'BAD_REQUEST');
        }

        // If the refresh token is not the same as the one in the database, go to logout
        if (user.refresh_token !== refreshToken) {
          debugInDevelopment('refreshToken: refresh_token failed', verifyRefreshToken);
          subscribeToLogout(user.id);
          serverLogout(null, null, { res });
          throw new ApolloError('Error token', 'BAD_REQUEST');
        }

        const newToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30m' });

        const TokenCookie = cookie.serialize(
          'auth-token',
          newToken,
          {
            ...cookieOptions,
          },
        );
        const refreshTokenCookie = cookie.serialize(
          'refresh-token',
          refreshToken,
          {
            ...cookieOptions,
          },
        );

        res.setHeader('set-cookie', [TokenCookie, refreshTokenCookie]);
        const userData = { id: user.id, role: user.role };
        return userData;
      } catch (refreshTokenError) {
        // If the error is refresh token expired, make a new refresh token
        try {
          if (refreshTokenError instanceof jwt.TokenExpiredError && decodeToken.activeSession) {
            debug('refreshToken is expired, new refresh token is starting');
            // make a new refreshtoken
            const newToken = jwt.sign({ id: decodeToken.id, role: decodeToken.role }, process.env.JWT_SECRET, { expiresIn: '30m' });
            const newRefreshToken = jwt.sign({ id: decodeToken.id, role: decodeToken.role, activeSession: decodeToken.activeSession }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
            // update the refresh token in the database
            await dataSources.dataDB.user.update(
              decodeToken.id,
              { refresh_token: newRefreshToken },
            );

            const TokenCookie = cookie.serialize(
              'auth-token',
              newToken,
              {
                ...cookieOptions,
              },
            );
            const refreshTokenCookie = cookie.serialize(
              'refresh-token',
              newRefreshToken,
              {
                ...cookieOptions,
              },
            );

            res.setHeader('set-cookie', [TokenCookie, refreshTokenCookie]);
            const userData = { id: decodeToken.id, role: decodeToken.role };
            return userData;
          }
        } catch (error) {
          debug('Failed to verify refresh token1');
          subscribeToLogout(decodeToken.id);
          serverLogout(null, null, { res });
          throw new AuthenticationError('Failed to verify make new refresh-token');
        }
      /*   subscribeToLogout(decodeToken.id);
        serverLogout(null, null, { res }); */
      }
    }
    debug('Failed to verify refresh token2');
    subscribeToLogout(decodeToken.id);
    serverLogout(null, null, { res });
    throw new AuthenticationError('Failed to verify token');
  }
  const userData = null;
  return userData;
}
