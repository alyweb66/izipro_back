import Debug from 'debug';
import { GraphQLError } from 'graphql';
import cookie from 'cookie';
// import pubsub from './pubSub.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:mutation`);

function secureEnv() {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  return true;
}

/**
 * Middleware function to handle server logout.
 *
 * @param {Object} _ - Unused parameter.
 * @param {Object} __ - Unused parameter.
 * @param {Object} context - The context object containing various properties.
 * @param {Object} context.res - The response object.
 * @param {Object} context.dataSources - The data sources object.
 * @param {Object} context.req - The request object.
 * @param {boolean} [context.server=false] - Flag indicating if the logout is server-initiated.
 *
 * @throws {GraphQLError} If there is an error removing the
 * refresh token or any other internal server error.
 *
 * @returns {Promise<boolean>} Returns true if the logout process is successful.
 */
export default async function serverLogout(_, __, {
  res, dataSources, req, server = false,
}) {
  debug('serverLogout is starting');

  try {
    if (!server) {
    // get refresh_token from cookie
      const cookies = cookie.parse(req.headers.cookie || '');

      const refreshToken = cookies['refresh-token'] || '';

      // remove refresh_token from the database
      if (dataSources.userData && refreshToken) {
        const removedToken = await dataSources.dataDB.user.modifyRefreshToken(
          dataSources.userData.id,
          refreshToken,
          'array_remove',
        );
        if (!removedToken) {
          throw new GraphQLError('Error removing refresh token', { extensions: { code: 'NOT_FOUND', httpStatus: 404 } });
        }
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
      'true',
      {
        httpOnly: false,
        sameSite: 'none',
        secure: true,
        domain: process.env.DOMAIN,
        path: '/',
      },
    );

    res.setHeader('set-cookie', [logoutCookie, TokenCookie, refreshTokenCookie]);

    return true;
  } catch (error) {
    debug(error);
    /*  throw new GraphQLError('Error serveur logout'); */
    debug('serverLogout error:', error.message, error.stack);
    throw new GraphQLError(error, { extensions: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 } });
  }
}
