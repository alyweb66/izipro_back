import * as turf from '@turf/turf';
import { GraphQLError } from 'graphql';
import Debug from 'debug';
import { newRequestEmail } from './sendEmail.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:middleware:checkViewedBeforeSendRequestEmail`);

/**
 * Check if the request has been viewed before sending an email
 *
 * @param {{urgent: boolean,
 * title: string,
* message: string,
* city: string,
* lng: number,
* lat: number,
* range: number,
* user_id: number,
* job_id: number,
*  media: Array}} request - The input object containing the request details.
 * @param {Object} dataSources - The data sources object containing the database access methods
 * @returns {Promise<boolean>} -
 * Returns false if the request has not been viewed or if an error occurs
 * @throws {ApolloError} - Throws an error if there is an issue with the database query
 */
export default async function checkViewedBeforeSendRequestEmail(
  request,
  dataSources,
  flattenedNotifications,
) {
  try {
    // get user data who has send request
    dataSources.dataDB.user.findByPkLoader.clear(request.user_id);
    const ownerRequestData = await dataSources.dataDB.user.findByPk(request.user_id);

    const userId = await
    dataSources.dataDB.userHasNotViewedRequest.getUserNotViewedConv(request.id);

    if (!userId) {
      return false;
    }

    if (userId.length > 0) {
      const filteredUsers = userId.filter((user) => {
        // Define the two points
        const requestPoint = turf.point([request.lng, request.lat]);
        const userPoint = turf.point([user.lng, user.lat]);
        // Calculate the distance in kilometers (default)
        const distance = turf.distance(requestPoint, userPoint);

        return (
          // Check if the request is in the user's range
          (distance < request.range / 1000 || request.range === 0)
          // Check if the request is in the user's settings range
          && (distance < user.range / 1000 || user.range === 0)
          // Check if the user is already in conversation with the request
          && (request.conversation === null || request.conversation === undefined
            || !request.conversation.some((conversation) => (
              conversation.user_1 !== null && conversation.user_2 !== null)
              && (conversation.user_1 === user.id || conversation.user_2 === user.id))
          )
        );
      });

      const filteredUserEmailOk = filteredUsers
        .filter((user) => flattenedNotifications
          .some((notification) => notification.user_id === user.id
            && notification.email_notification === true));

      if (filteredUserEmailOk && filteredUserEmailOk.length > 0) {
        filteredUsers.forEach((user) => {
          newRequestEmail(user, request, ownerRequestData);
        });
      }
    }

    return false;
  } catch (error) {
    debug('error', error);
    throw new GraphQLError(error, { extensions: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 } });
  }
}
