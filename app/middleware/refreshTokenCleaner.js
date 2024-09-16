import Debug from 'debug';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import ServerRequest from '../datasources/data/datamappers/serverRequest.js';

const refreshTokenInstance = new ServerRequest();

const debug = Debug(`${process.env.DEBUG_MODULE}:middleware:refreshTokenCleaner`);

// This function checks the validity of the refresh token
// and removes it from the database if it is expired
/**
 * Checks the validity of a user's refresh tokens
 * and removes them if they have been expired for more than one day.
 *
 * @param {integer} userId - The ID of the user whose refresh tokens need to be checked.
 * @param {Object} dataSources - The data sources used to access the database.
 * @param {Object} dataSources.dataDB - The database containing user information.
 * @param {Object} dataSources.dataDB.user - The user object in the database.
 * @param {Function} dataSources.dataDB.user.modifyRefreshToken -
 * The function to modify the user's refresh tokens.
 * @returns nothing
 * @throws {Error} - Throws an error if removing a refresh token fails.
 */
const checkRefreshTokenValidity = async (userId, dataSources) => {
  // Get the user data from the database
  const user = await refreshTokenInstance.getRefreshTokenByUserId(userId);
  const { refresh_token: refreshTokens } = user;

  if (refreshTokens.length === 0) {
    debug('No refresh token found for user');
    return;
  }

  try {
    debug('Checking refresh token validity');
    const promises = refreshTokens.map(async (refreshToken) => {
      const decodedToken = jwt.decode(refreshToken, process.env.JWT_SECRET);
      const expirationDate = new Date(decodedToken.exp * 1000);
      const currentDate = new Date();
      const threeMonthsAgo = new Date();
      // oneDayAgo.setDate(currentDate.getDate() - 1);
      threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

      // if the refresh token has expired more than three months ago, remove it
      if (expirationDate < threeMonthsAgo) {
        debug('Refresh token expired:', refreshToken);

        const removedToken = await dataSources.dataDB.user.modifyRefreshToken(
          userId,
          refreshToken,
          'array_remove',
        );

        if (!removedToken) {
          throw new GraphQLError('Error removing refresh token', { extensions: { code: 'BAD_REQUEST', httpStatus: 400 } });
        }
      }
    });

    // wait for all promises to resolve
    await Promise.all(promises);
  } catch (error) {
    debug('Error decoding refresh token:', error);
  }
};

export default checkRefreshTokenValidity;
