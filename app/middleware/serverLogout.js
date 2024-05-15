import Debug from 'debug';
import { ApolloError } from 'apollo-server-core';
import cookie from 'cookie';
// import pubSub from './pubSub.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:mutation`);

function secureEnv() {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  return true;
}

export default async function serverLogout(_, __, { res }) {
  debug('serverLogout is starting');

  try {
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

    res.setHeader('set-cookie', [TokenCookie, refreshTokenCookie]);

    return true;
  } catch (err) {
    debug(err);
    throw new ApolloError('Error', err);
  }
}
