import * as turf from '@turf/turf';
import { newRequestEmail } from './sendEmail.js';

export default async function checkViewedBeforeSendRequestEmail(request, dataSources) {
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

    if (filteredUsers && filteredUsers.length > 0) {
      filteredUsers.forEach((user) => {
        newRequestEmail(user, request);
      });
    }
  }

  return false;
}
