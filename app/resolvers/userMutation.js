import Debug from 'debug';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { GraphQLError } from 'graphql';
import {
  AuthenticationError, ApolloError, UserInputError,
} from 'apollo-server-core';
import * as fs from 'node:fs/promises';
import path from 'path';
import url from 'url';
import handleUploadedFiles from '../middleware/handleUploadFiles.js';
import * as sendEmail from '../middleware/sendEmail.js';
import SirenAPI from '../datasources/SirenAPI/index.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:resolver:mutation`);

// __dirname not on module, this is the way to use it.
const fileName = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(fileName);
const directoryPath = path.join(dirname, '..', '..', 'public', 'media');

function debugInDevelopment(message = '', value = '') {
  if (process.env.NODE_ENV === 'development') {
    debug('⚠️', message, value);
  }
}
/* function sameSiteEnv() {
  if (process.env.NODE_ENV === 'development') {
    return 'none';
  }
  return 'strict';
} */
function secureEnv() {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  return true;
}

// function to delete the files from the public folder
async function deleteFile(file) {
  console.log('file', file);
  if (!file) {
    debugInDevelopment('No file to delete');
    return;
  }

  const filePath = path.join(directoryPath, file);

  try {
    await fs.unlink(filePath);
    debugInDevelopment(`File ${file} deleted successfully`);
  } catch (err) {
    debugInDevelopment(`Error deleting file: ${err}`);
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
  debug('createUser is starting');
  debugInDevelopment(input);
  try {
  // Check if user exists
    const existingUser = await dataSources.dataDB.user.findUserByEmail(input.email);
    if (existingUser) {
      throw new ApolloError('Email ou mot de passe incorrect', 'BAD_REQUEST');
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Check if the siret is valid
    const siret = Number(input.siret);
    let siretData = null;
    if (input.siret) {
      const sirenAPI = new SirenAPI();
      siretData = await sirenAPI.getSiretData(siret);
      if (!siretData.siret) {
        throw new ApolloError('Siret not found', 'BAD_REQUEST');
      }
      if (Number(siretData.siret) !== input.siret) {
        throw new ApolloError('Siret not found', 'BAD_REQUEST');
      }
    }

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
      denomination: siretData ? siretData.uniteLegale.denominationUniteLegale : null,
      role: addRole,
      remember_token: token,
    };

    const createdUser = await dataSources.dataDB.user.create(userInputWithHashedPassword);
    if (!createdUser.id) {
      throw new ApolloError('Error creating user', 'BAD_REQUEST');
    }

    const createSetting = await dataSources.dataDB.userSetting.create({ user_id: createdUser.id });

    if (!createSetting.id) {
      throw new ApolloError('Error creating user setting', 'BAD_REQUEST');
    }

    return createdUser;
  } catch (err) {
    debug(err);
    throw new GraphQLError('Error');
  }
}

async function confirmRegisterEmail(_, { input }, { dataSources }) {
  debug('confirmRegisterEmail is starting');
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
  debug('login is starting');
  debugInDevelopment(input);
  try {
    dataSources.dataDB.user.cache.clear();
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
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // activeSession or not that is the question
    let refreshToken;
    debugInDevelopment('input.activeSession', input.activeSession);
    if (input.activeSession) {
      refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
    } else {
      refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
    }
    const saveRefreshToken = await dataSources.dataDB.user.update(
      user.id,
      { refresh_token: refreshToken },
    );
    debugInDevelopment('saveRefreshToken', saveRefreshToken);

    // Set the token as a cookie
    const TokenCookie = cookie.serialize(
      'auth-token',
      token,
      {
        httpOnly: true,
        sameSite: 'strict',
        secure: secureEnv(),
        domain: 'localhost',
        path: '/',
      },
    );
    const refreshTokenCookie = cookie.serialize(
      'refresh-token',
      refreshToken,
      {
        httpOnly: true,
        sameSite: 'strict',
        secure: secureEnv(),
        domain: 'localhost',
        path: '/',
      },
    );

    res.setHeader('set-cookie', [TokenCookie, refreshTokenCookie]);
    return true;
  } catch (err) {
    debug(err);
    throw new ApolloError('Error');
  }
}

async function logout(_, { id }, { dataSources, res }) {
  debug('logout is starting');
  try {
    // Controle if it's the good user who want to logout
    let TokenCookie;
    let refreshTokenCookie;
    if (dataSources.userData.id === id) {
      const pastDate = new Date(0);
      TokenCookie = cookie.serialize(
        'auth-token',
        '',
        {
          httpOnly: true, sameSite: 'strict', secure: secureEnv(), expires: pastDate,
        },
      );
      refreshTokenCookie = cookie.serialize(
        'refresh-token',
        '',
        {
          httpOnly: true, sameSite: 'strict', secure: secureEnv(), expires: pastDate,
        },
      );
    }
    // eslint-disable-next-line no-param-reassign
    dataSources.userData = null;
    res.setHeader('set-cookie', [TokenCookie, refreshTokenCookie]);
    return true;
  } catch (err) {
    debug(err);
    throw new ApolloError('Error', err);
  }
}

async function deleteUser(_, { id }, { dataSources, res }) {
  debug('delete user is starting', id);
  try {
  // Check if the user is logged in
    if (dataSources.userData === null || dataSources.userData.id !== id) {
      throw new AuthenticationError('Unauthorized');
    }

    const user = await dataSources.dataDB.user.findByPk(id);

    if (!user) {
      throw new ApolloError('User not found', 'NOT_FOUND');
    }
    dataSources.dataDB.user.delete(id);
    logout(null, null, { res });
    return true;
  } catch (err) {
    debug(err);
    throw new ApolloError('Error');
  }
}

async function forgotPassword(_, { input }, { dataSources }) {
  try {
    const user = await dataSources.dataDB.user.findUserByEmail(input.email);
    if (!user) {
      throw new ApolloError('User not found', 'BAD_REQUEST');
    }
    debug('Token is generated');
    const resetToken = jwt.sign({ id: user.id, email: input.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await dataSources.dataDB.user.update(user.id, { remember_token: resetToken });

    await sendEmail.sendPasswordResetEmail(input.email, resetToken);
    debug('Email sent');
    return true;
  } catch (err) {
    debug(err);
    throw new ApolloError('Error', 'BAD_REQUEST');
  }
}

async function validateForgotPassword(_, { input }, { dataSources }) {
  debug('validation forgot password is starting');
  debugInDevelopment(input);
  try {
    const { token } = input;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken.id) {
      throw new ApolloError('Token is invalid', 'BAD_REQUEST');
    }

    // Check if user exists
    const existingUser = await dataSources.dataDB.user.findUserByEmail(decodedToken.email);
    if (!existingUser) {
      throw new ApolloError('Email ou mot de passe incorrect', 'BAD_REQUEST');
    }
    // Check if the token is the same as the one in the database
    if (existingUser.remember_token !== token && decodedToken.id !== existingUser.id) {
      throw new UserInputError('Error token');
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Update the input object with the hashed password
    const userInputWithHashedPassword = {
      ...input,
      password: hashedPassword,
      remember_token: null,
    };

    delete userInputWithHashedPassword.token;

    dataSources.dataDB.user.update(existingUser.id, userInputWithHashedPassword);
    return true;
  } catch (err) {
    debug(err);
    throw new GraphQLError('Error');
  }
}

async function updateUser(_, { id, input }, { dataSources }) {
  debug('updateUser is starting');
  debugInDevelopment('input', input);

  try {
    if (dataSources.userData === null || dataSources.userData.id !== id) {
      throw new AuthenticationError('Unauthorized');
    }
    // Remove siret and company_name if the user is not a pro
    const updateInput = { ...input };
    if (dataSources.userData.role === 'user') {
      delete updateInput.siret;
      delete updateInput.denomination;
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

    // mapping the media array to createReadStream
    let imageInput;
    if (input.image && input.image.length > 0 && input.image[0].file) {
      const ReadStreamArray = await Promise.all(input.image.map(async (upload) => {
        const fileUpload = upload.file;
        if (!fileUpload) {
          throw new Error('File upload not complete');
        }
        const { createReadStream, filename, mimetype } = await fileUpload;
        const readStream = createReadStream();
        const file = {
          filename,
          mimetype,
          buffer: readStream,
        };
        return file;
      }));

      // calling the handleUploadedFiles function to compress the images and save them
      const media = await handleUploadedFiles(ReadStreamArray);

      // replace input.image with the media url
      if (!media) {
        throw new ApolloError('Error creating media');
      }

      imageInput = media[0].url;

      // delete the old profile picture in folder
      if (user.image) {
        await fs.readdir(path.join(directoryPath), (err) => {
          if (err) {
            debugInDevelopment(`Error reading directory: ${err}`);
          } else {
            const urlObject = new URL(user.image);
            const filename = path.basename(urlObject.pathname);
            deleteFile(filename);
          }
        });
      }
    }

    // Update the input image with the new url
    if (imageInput) {
      updateInput.image = imageInput;
    }

    dataSources.dataDB.user.cache.clear();
    return dataSources.dataDB.user.update(id, updateInput);
  } catch (err) {
    if (err instanceof AuthenticationError) {
      throw err;
    }
    throw new ApolloError('Error');
  }
}

async function changePassword(_, { id, input }, { dataSources }) {
  debug('changePassword is starting');
  const { oldPassword, newPassword } = input;
  try {
    // Check if the user is logged in
    if (dataSources.userData === null || dataSources.userData.id !== id) {
      throw new AuthenticationError('Unauthorized');
    }
    const user = await dataSources.dataDB.user.findByPk(id);
    if (!user) {
      throw new ApolloError('User not found', 'BAD_REQUEST');
    }
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new ApolloError('Incorrect password', 'BAD_REQUEST');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await dataSources.dataDB.user.update(
      dataSources.userData.id,
      { password: hashedNewPassword },
    );
    await sendEmail.changePasswordEmail(user.email);
    return true;
  } catch (err) {
    debug(err);
    if (err instanceof AuthenticationError) {
      throw err;
    }
    throw new ApolloError('Error', 'BAD_REQUEST');
  }
}

async function deleteProfilePicture(_, { id }, { dataSources }) {
  debug('deleteProfilePicture is starting');
  try {
    // Check if the user is logged in
    if (dataSources.userData === null || dataSources.userData.id !== id) {
      throw new AuthenticationError('Unauthorized');
    }

    const user = await dataSources.dataDB.user.findByPk(id);
    if (!user) {
      throw new ApolloError('User not found', 'NOT_FOUND');
    }

    // delete the old profile picture in folder
    fs.readdir(path.join(directoryPath), (err) => {
      if (err) {
        debugInDevelopment(`Error reading directory: ${err}`);
      } else {
        const urlObject = new URL(user.image);
        const filename = path.basename(urlObject.pathname);
        deleteFile(filename);
      }
    });

    // Update the user image to null
    await dataSources.dataDB.user.update(id, { image: null });
    return true;
  } catch (err) {
    debug(err);
    if (err instanceof AuthenticationError) {
      throw err;
    }
    throw new ApolloError('Error');
  }
}

export default {
  createUser: createUserFunction,
  createProUser: createUserFunction,
  deleteUser,
  login,
  logout,
  forgotPassword,
  confirmRegisterEmail,
  updateUser,
  changePassword,
  validateForgotPassword,
  deleteProfilePicture,
};
