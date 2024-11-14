import Debug from 'debug';
import sendPushNotification from './webPush.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:middleware:sendPushNotification`);

/**
 * Sends push notifications to users based on the provided item ID and message type.
 *
 * @param {number} itemId - The ID of the item (conversation or request) to send notifications for.
 * @param {Object} dataSources - The data sources object containing database access methods.
 * @param {boolean} [message=false] -
 * Indicates whether the notification is for a message (true) or a request (false).
 * @returns {Promise<{notifications: Array<Object>}>} -
 * A promise that resolves to an object containing the notifications sent.
 */
export default async function sendNotificationsPush(
  itemId,
  dataSources,
  message = false,
) {
  debug('sendNotificationsPush starting', itemId, message);
  let targetUser = [];
  if (message) {
    targetUser = await
    dataSources.dataDB.userHasNotViewedConversation.getUserByConversationId(
      itemId,
    );
  } else {
    targetUser = await
    dataSources.dataDB.userHasNotViewedRequest.getUserByRequestId(
      itemId,
    );
  }

  console.log('targetUser', targetUser);

  // get the notification subscription of the target user
  /**
 * @type {Array<{id: number, user_id: number, denomination: string,
    * first_name: string, last_name: string, email_notification: boolean,
    * endpoint: string, public_key: string, auth_token: string}>}
    */
  let notifications = [];
  /*  let usersNotification = []; */
  if (message) {
    if (targetUser.length > 0) {
      console.log('message', message);

      notifications = await dataSources.dataDB.notification.getAllNotifications(
        targetUser[0]?.user_id,
      );
    }
  } else if (targetUser.length > 0) {
    // filter only the id of the user
    const userId = targetUser.map((user) => user.user_id);
    console.log('userId', userId);

    // clear cache for the conversation
    dataSources.dataDB.notificationPush.findByUserIdsLoader.clear(userId);
    // get the notification subscription of the target user
    const usersNotification = await dataSources.dataDB.notification.getAllNotifications(
      userId,
    );

    notifications = usersNotification.flat();
  }
  console.log('notifications', notifications);

  if (notifications.length > 0 && notifications[0].endpoint) {
    await Promise.all(notifications.map(async (element) => {
      const subscription = {
        endpoint: element.endpoint,
        keys: {
          p256dh: element.public_key,
          auth: element.auth_token,
        },
      };

      const payload = JSON.stringify({
        title: message
          ? `${element.role === 'pro' ? element.denomination : element.first_name}, vous avez un nouveau message`
          : `${element.denomination}, vous avez une nouvelle demande`,
        body: 'Cliquez pour le consulter',
        icon: process.env.LOGO_NOTIFICATION_URL,
        tag: itemId,
        renotify: true,
      });

      try {
        await sendPushNotification(subscription, payload);
        debug('Notification sent successfully');
      } catch (error) {
        debug('error', error);
      }
    }));
  }

  return { notifications };
}
