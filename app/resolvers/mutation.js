import Debug from 'debug';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { AuthenticationError, ApolloError, ForbiddenError } from 'apollo-server-core';
import sendPasswordResetEmail from '../middleware/sendEmail.js';

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

/**
 *
 * @param {*} _ parent object
 * @param {*} param1 destructuring input from the mutation
 * @param {*} param2 destructuring dataSources from the context
 * @returns
 */
async function createUserFunction(_, { input }, { dataSources }) {
  debugInDevelopment(input);

  // Check if user exists
  const existingUser = await dataSources.dataDB.user.findUserByEmail(input.email);
  if (existingUser) {
    throw new ApolloError('Email ou mot de passe incorrect', 'BAD_REQUEST');
  }
  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash(input.password, 10);

  // Determine role based on the email address
  const addRole = input.siret ? 'pro' : 'user';

  // Update the input object with the hashed password
  const userInputWithHashedPassword = {
    ...input,
    password: hashedPassword,
    role: addRole,
  };
  return dataSources.dataDB.user.create(userInputWithHashedPassword);
}

async function deleteUser(_, { id }, { dataSources }) {
  const user = await dataSources.dataDB.user.findByPk(id);
  if (!user) {
    throw new ApolloError('User not found', 'NOT_FOUND');
  }
  if (user.id !== id) {
    throw new ForbiddenError('Not authorized');
  }
  return dataSources.dataDB.user.delete(id);
}

async function login(_, { input }, { dataSources, res }) {
  debugInDevelopment(input);

  const user = await dataSources.dataDB.user.findUserByEmail(input.email);
  if (!user) {
    debugInDevelopment('login:user failed', user);
    throw new ApolloError('Email ou mot de passe incorrect', 'BAD_REQUEST');
  }
  const validPassword = await bcrypt.compare(input.password, user.password);
  if (!validPassword) {
    debugInDevelopment('login:validPassword failed', validPassword);
    throw new ApolloError('Email ou mot de passe incorrect', 'BAD_REQUEST');
  }
  // Create a token
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '14d' });
  const saveRefreshToken = await dataSources.dataDB.user.update(
    user.id,
    { refresh_token: refreshToken },
  );
  debugInDevelopment('saveRefreshToken', saveRefreshToken);

  // Set the token as a cookie
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
  return true;
}

async function logout(_, __, { res }) {
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
  return true;
}

async function refreshUserToken(_, __, { dataSources, req, res }) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const refreshToken = cookies['refresh-token'] || '';
  debugInDevelopment('refreshToken', refreshToken);

  try {
    const { id } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await dataSources.dataDB.user.findByPk(id);
    if (!user) {
      debugInDevelopment('refreshToken:user failed');
      throw new ApolloError('User not found', 'BAD_REQUEST');
    }
    if (user.refresh_token !== refreshToken) {
      debugInDevelopment('refreshToken:refresh_token failed', refreshToken);
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
    return true;
  } catch (err) {
    debug('Error', err);
    throw new AuthenticationError('Invalid refresh token');
  }
}

async function forgotPassword(_, { input }, { dataSources }) {
  try {
    const user = await dataSources.dataDB.user.findUserByEmail(input.email);
    if (!user) {
      throw new ApolloError('User not found', 'BAD_REQUEST');
    }
    debug('Token is generated');
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await dataSources.dataDB.user.update(user.id, { remember_token: resetToken });

    await sendPasswordResetEmail(input.email, resetToken);
    debug('Email sent');
    return true;
  } catch (err) {
    debug(err);
    throw new ApolloError('Error', 'BAD_REQUEST');
  }
}

export default {
  createUser: createUserFunction,
  createProUser: createUserFunction,
  deleteUser,
  login,
  logout,
  refreshUserToken,
  forgotPassword,
};
