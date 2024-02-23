import Debug from 'debug';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:mutation`);

function debugInDevelopment(message) {
  if (process.env.NODE_ENV === 'development') {
    debug(message);
  }
}

/**
     * Create a user
     * @param {*} _
     * @param {*} input the data sent to create the user
     * @param {*} dataSources the data in the context server
     * @returns
     */
async function createUserFunction(_, { input }, { dataSources }) {
  debugInDevelopment(input);

  // Check if user exists
  const existingUser = await dataSources.dataDB.user.findUserByEmail(input.email);
  if (existingUser) {
    throw new GraphQLError('Email ou mot de passe incorrect');
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
    throw new GraphQLError('User not found');
  }
  if (user.id !== id) {
    throw new GraphQLError('Not authorized');
  }
  return dataSources.dataDB.user.delete(id);
}

async function login(_, { email, password }, { dataSources }) {
  debugInDevelopment(email);
  const user = await dataSources.dataDB.user.findUserByEmail(email);
  if (!user) {
    debugInDevelopment('login:user failed', user);
    throw new GraphQLError('Email ou mot de passe incorrect');
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    debugInDevelopment('login:validPassword failed', validPassword);
    throw new GraphQLError('Email ou mot de passe incorrect');
  }
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return { token };
}
export default {
  createUser: createUserFunction,
  createProUser: createUserFunction,
  deleteUser,
  login,
};
