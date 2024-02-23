import Debug from 'debug';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticationError, ApolloError, ForbiddenError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:mutation`);

function debugInDevelopment(message) {
  if (process.env.NODE_ENV === 'development') {
    debug(message);
  }
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

async function login(_, { input }, { dataSources }) {
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
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '14d' });
  const saveRefreshToken = await dataSources.dataDB.user.update(
    user.id,
    { refresh_token: refreshToken },
  );
  debugInDevelopment(saveRefreshToken);
  return { token, refreshToken };
}

async function refreshUserToken(_, { input }, { dataSources }) {
  const { refreshToken } = input;
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
    return { token };
  } catch (err) {
    debug('Error', err);
    throw new AuthenticationError('Invalid refresh token');
  }
}
export default {
  createUser: createUserFunction,
  createProUser: createUserFunction,
  deleteUser,
  login,
  refreshUserToken,
};
