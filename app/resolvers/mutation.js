import Debug from 'debug';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import {
  AuthenticationError, ApolloError, ForbiddenError, UserInputError,
} from 'apollo-server-core';
import * as sendEmail from '../middleware/sendEmail.js';

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

  // Create a token and send an email to confirm the email address
  const token = jwt.sign({ email: input.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  debugInDevelopment('Token is generated', token);
  await sendEmail.confirmEmail(input.email, token);
  debug('confirmEmail sent');

  // Update the input object with the hashed password
  const userInputWithHashedPassword = {
    ...input,
    password: hashedPassword,
    role: addRole,
    remember_token: token,
  };

  return dataSources.dataDB.user.create(userInputWithHashedPassword);
}

async function confirmRegisterEmail(_, { input }, { dataSources }) {
  try {
    const { token } = input;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    // Clear the user cache
    dataSources.dataDB.user.cache.clear();
    // check if id in the token is present that mean user is changing his email
    if (decodedToken.userId) {
      user = await dataSources.dataDB.user.findByPk(decodedToken.userId);
    } else {
      user = await dataSources.dataDB.user.findUserByEmail(decodedToken.email);
    }

    if (!user) {
      throw new ApolloError('User not found', 'BAD_REQUEST');
    }
    if (user.remember_token !== token) {
      throw new UserInputError('Error token');
    }
    await dataSources.dataDB.user.update(user.id, {
      email: decodedToken.email,
      remember_token: null,
      verified_email: true,
    });
    return true;
  } catch (err) {
    debug(err);
    throw new ApolloError('Error');
  }
}

async function login(_, { input }, { dataSources, res }) {
  debugInDevelopment(input);

  const user = await dataSources.dataDB.user.findUserByEmail(input.email);

  if (!user) {
    debugInDevelopment('login:user failed', user);
    throw new ApolloError('Incorrect email or password', 'BAD_REQUEST');
  }
  if (user.verified_email === false) {
    debugInDevelopment('login:verified_email false');
    throw new ApolloError('Unverified email', 'BAD_REQUEST');
  }

  const validPassword = await bcrypt.compare(input.password, user.password);

  if (!validPassword) {
    debugInDevelopment('login:validPassword failed', validPassword);
    throw new ApolloError('EIncorrect email or password', 'BAD_REQUEST');
  }
  // Create a token
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1m' });

  const refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '2m' });
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
  debug('logout is starting');
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

async function deleteUser(_, { id }, { dataSources, res }) {
  debug('delete user is starting', id);
  if (dataSources.userData.id !== id) {
    throw new ForbiddenError('Not authorized');
  }

  const user = await dataSources.dataDB.user.findByPk(id);

  if (!user) {
    throw new ApolloError('User not found', 'NOT_FOUND');
  }
  dataSources.dataDB.user.delete(id);
  logout(null, null, { res });
  return true;
}

// async function refreshUserToken(_, __, { dataSources, req, res }) {
//   const cookies = cookie.parse(req.headers.cookie || '');
//   const refreshToken = cookies['refresh-token'] || '';
//   debugInDevelopment('refreshToken', refreshToken);

//   try {
//     const { id } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
//     const user = await dataSources.dataDB.user.findByPk(id);
//     if (!user) {
//       debugInDevelopment('refreshToken:user failed');
//       throw new ApolloError('User not found', 'BAD_REQUEST');
//     }
//     if (user.refresh_token !== refreshToken) {
//       debugInDevelopment('refreshToken:refresh_token failed', refreshToken);
//       throw new ApolloError('Error token', 'BAD_REQUEST');
//     }
//     // Make a new token
//     const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

//     // Add the new token to the cookies
//     const TokenCookie = cookie.serialize(
//       'auth-token',
//       token,
//       { httpOnly: true, sameSite: sameSiteEnv(), secure: secureEnv() },
//     );
//     const refreshTokenCookie = cookie.serialize(
//       'refresh-token',
//       refreshToken,
//       { httpOnly: true, sameSite: sameSiteEnv(), secure: secureEnv() },
//     );

//     res.setHeader('set-cookie', [TokenCookie, refreshTokenCookie]);
//     return true;
//   } catch (err) {
//     debug('Error', err);
//     throw new AuthenticationError('Invalid refresh token');
//   }
// }

async function forgotPassword(_, { input }, { dataSources }) {
  try {
    const user = await dataSources.dataDB.user.findUserByEmail(input.email);
    if (!user) {
      throw new ApolloError('User not found', 'BAD_REQUEST');
    }
    debug('Token is generated');
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await dataSources.dataDB.user.update(user.id, { remember_token: resetToken });

    await sendEmail.sendPasswordResetEmail(input.email, resetToken);
    debug('Email sent');
    return true;
  } catch (err) {
    debug(err);
    throw new ApolloError('Error', 'BAD_REQUEST');
  }
}

async function updateUser(_, { id, input }, { dataSources }) {
  if (dataSources.userData.id !== id) {
    throw new ForbiddenError('Not authorized');
  }
  // Remove siret and company_name if the user is not a pro
  const updateInput = { ...input };
  if (dataSources.userData.role === 'user') {
    delete updateInput.siret;
    delete updateInput.company_name;
  }

  const user = await dataSources.dataDB.user.findByPk(id);
  // Check if the email has changed to send a new confirmation email
  if (input.email) {
    if (input.email !== user.email) {
      const token = jwt.sign({ email: input.email, userId: id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      await dataSources.dataDB.user.update(id, { remember_token: token });
      await sendEmail.confirmEmail(input.email, token);
      debug('Email has changed');
      delete updateInput.email;
    }
  }
  if (!user) {
    throw new ApolloError('User not found', 'NOT_FOUND');
  }

  return dataSources.dataDB.user.update(id, updateInput);
}

export default {
  createUser: createUserFunction,
  createProUser: createUserFunction,
  deleteUser,
  login,
  logout,
  // refreshUserToken,
  forgotPassword,
  confirmRegisterEmail,
  updateUser,
};
