import Debug from 'debug';
import bcrypt from 'bcrypt';

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
    throw new Error('Email ou mot de passe incorrect');
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

export default {
  createUser: createUserFunction,
  createProUser: createUserFunction,
};
