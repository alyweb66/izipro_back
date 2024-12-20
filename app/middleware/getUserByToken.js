import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import Debug from 'debug';
import { GraphQLError } from 'graphql';
// import serverLogout from './serverLogout.js';
import pubsub from './pubSub.js';
import ServerRequest from '../datasources/data/datamappers/serverRequest.js';
import logger from './logger.js';

const refreshTokenInstance = new ServerRequest();
// const UserMutation = new User();

const debug = Debug(`${process.env.DEBUG_MODULE}:getUserByToken`);

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}

/**
 * Publishes a logout event for a given user.
 *
 * This function is used to notify subscribers that a user has logged out.
 * It publishes an event to the `LOGOUT` channel with the user's ID
 * and a value indicating the logout status.
 *
 * @param {string|number} userId - The ID of the user who is logging out.
 */
function subscribeToLogout(userId, sessionId, multipleSession = false) {
  debugInDevelopment('subscribeToLogout', userId);
  const subValue = {
    id: userId,
    value: true,
    multiple: multipleSession,
    session: String(sessionId),
  };
  pubsub.publish('LOGOUT', {
    logout: subValue,
  });
}

let cookieOptions;

// this function is used to get the user by token and verify token, if the token is expired,
// it will refresh the token
// and if the refresh token is expired, it will make a new refresh token
export default async function getUserByToken(req, res, dataSources) {
  debug('starting get user by token');

  const cookies = cookie.parse(req.headers.cookie || '');
  debugInDevelopment('cookies', cookies);

  const token = cookies['auth-token'] || '';
  const refreshToken = cookies['refresh-token'] || '';
  const sessionId = cookies['session-id'] || '';

  // const currentDomain = req.headers.host;

  let decodeToken;
  let userDataDecoded;
  try {
    // If the token is valid, return the user data
    if (token) {
      userDataDecoded = jwt.decode(token, process.env.JWT_SECRET);

      if (
        req.headers.userid
        && parseInt(req.headers.userid, 10) !== userDataDecoded.id
      ) {
        debug('Wrong session');
        subscribeToLogout(userDataDecoded.id, sessionId, true);
        subscribeToLogout(parseInt(req.headers.userid, 10), sessionId, true);
        return null;
      }

      const userData = jwt.verify(token, process.env.JWT_SECRET);
      debugInDevelopment('userData', userData);

      return userData;
    }
    // If the token is not found, go to logout
    debugInDevelopment('getUserByToken: token not found');
    return null;
  } catch (tokenError) {
    debug('Failed to verify token', tokenError, userDataDecoded);

    if (tokenError instanceof jwt.TokenExpiredError) {
      if (userDataDecoded && !userDataDecoded.activeSession) {
        debug('Outdated session', tokenError);
        subscribeToLogout(userDataDecoded.id, sessionId);
        return null;
      }
      // If the error is token expired, refresh the token
      debug('refreshToken is starting');

      try {
        if (!refreshToken) {
          debug('refreshToken not found');
          subscribeToLogout(userDataDecoded.id, sessionId);
          return null;
        }
        // decode the refresh token to get the user id
        decodeToken = jwt.decode(refreshToken);
        // clear user cache
        dataSources.dataDB.user.cache.clear();
        const user = await refreshTokenInstance.getRefreshTokenByUserId(
          decodeToken.id,
        );

        const verifyRefreshToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        );

        // If the refresh token is not valid, go to logout
        if (!verifyRefreshToken) {
          debugInDevelopment('refreshToken: verifyRefreshToken failed');
          throw new GraphQLError('Error token', {
            extensions: { code: 'UNAUTHENTICATED', httpStatus: 401 },
          });
        }

        // If the user is not found, go to logout
        if (!user) {
          debugInDevelopment('refreshToken: user failed');
          subscribeToLogout(verifyRefreshToken.id, sessionId);
          return null;
        }

        // find the refresh token in the database
        const findRefreshToken = user.refresh_token.find(
          (element) => element === refreshToken,
        );

        // If the refresh token is not the same as the one in the database, go to logout
        if (!findRefreshToken || findRefreshToken !== refreshToken) {
          debugInDevelopment(
            'refreshToken: refresh_token failed',
            verifyRefreshToken,
          );
          subscribeToLogout(user.id, sessionId);
          return null;
        }

        const newToken = jwt.sign(
          {
            id: user.id,
            role: user.role,
            activeSession: userDataDecoded.activeSession,
          },
          process.env.JWT_SECRET,
          { expiresIn: '1h' },
        );

        cookieOptions = {
          httpOnly: true,
          secure: true,
          sameSite: 'Strict',
          domain: process.env.DOMAIN,
          path: '/',
          ...(decodeToken.activeSession
            ? { maxAge: 60 * 60 * 24 * 365 * 5 }
            : {}),
        };

        const TokenCookie = cookie.serialize('auth-token', newToken, {
          ...cookieOptions,
        });
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
          if (
            refreshTokenError instanceof jwt.TokenExpiredError
            && decodeToken.activeSession
          ) {
            debug('refreshToken is expired, new refresh token is starting');
            // make a new refreshtoken
            const newToken = jwt.sign(
              {
                id: decodeToken.id,
                role: decodeToken.role,
                activeSession: decodeToken.activeSession,
              },
              process.env.JWT_SECRET,
              { expiresIn: '1h' },
            );
            const newRefreshToken = jwt.sign(
              {
                id: decodeToken.id,
                role: decodeToken.role,
                activeSession: decodeToken.activeSession,
              },
              process.env.REFRESH_TOKEN_SECRET,
              { expiresIn: '1d' },
            );
            // update the refresh token in the database
            await dataSources.dataDB.user.modifyRefreshToken(
              decodeToken.id,
              newRefreshToken,
              'array_replace',
              refreshToken,
            );

            const TokenCookie = cookie.serialize('auth-token', newToken, {
              ...cookieOptions,
            });
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
          logger.error({
            message: error.message,
            stack: error.stack,
            extensions: error.extensions,
          });
          debug('Failed to verify refresh token1');
          subscribeToLogout(decodeToken.id, sessionId);
        }
        logger.error({
          message: refreshTokenError.message,
          stack: refreshTokenError.stack,
          extensions: refreshTokenError.extensions,
        });
      }
    }

    debug('Failed to verify refresh token2');
    subscribeToLogout(decodeToken.id, sessionId);
    return null;
  }
}
