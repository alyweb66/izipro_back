import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';
import cookie from 'cookie';
// import pubsub from './pubSub.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:mutation`);

function secureEnv() {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  return true;
}

export default async function serverLogout(_, __, {
  res, dataSources, req, server = false,
}) {
  debug('serverLogout is starting');

  try {
    if (!server) {
    // get refresh_token from cookie
      const cookies = cookie.parse(req.headers.cookie || '');

      const refreshToken = cookies['refresh-token'] || '';

      if (!refreshToken) {
        throw new Error('Refresh token not found in cookies');
      }

      try {
        // remove refresh_token from the database
        if (dataSources.userData) {
          const removedToken = await dataSources.dataDB.user.modifyRefreshToken(
            dataSources.userData.id,
            refreshToken,
            'array_remove',
          );
          if (!removedToken) {
            throw new Error('Error removing refresh token');
          }
        }
      } catch (dbError) {
        debug('Database error:', dbError);
        throw new ApolloError('Failed to remove refresh token from database');
      }
    }

    const pastDate = new Date(0);
    const TokenCookie = cookie.serialize(
      'auth-token',
      '',
      {
        httpOnly: true, sameSite: 'strict', secure: secureEnv(), expires: pastDate,
      },
    );
    const refreshTokenCookie = cookie.serialize(
      'refresh-token',
      '',
      {
        httpOnly: true, sameSite: 'strict', secure: secureEnv(), expires: pastDate,
      },
    );
    const logoutCookie = cookie.serialize(
      'logout',
      true,
      {
        httpOnly: false,
        sameSite: 'none',
        secure: secureEnv(),
        domain: process.env.DOMAIN,
        path: '/',
      },
    );

    res.setHeader('set-cookie', [TokenCookie, refreshTokenCookie, logoutCookie]);

    return true;
  } catch (err) {
    debug(err);
    throw new ApolloError('Error serveur logout');
  }
}
