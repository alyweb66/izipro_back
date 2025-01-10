import Debug from 'debug';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import logger from './logger.js';
import sendPushNotification from './webPush.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:middleware:cleanOldData`);

const mediaDirectory = './public/media';
/**
 * Checks and deletes obsolete media files from the media directory.
 *
 * @async
 * @function checkObsoleteMedia
 * @param {Object} dataSources - The data sources object containing database access methods.
 * @param {Object} dataSources.dataDB - The database access object.
 * @param {Object} dataSources.dataDB.media - The media database access object.
 * @param {Function} dataSources.dataDB.media.getAllMediaNames -
 * Function to get all media names from the database.
 * @returns {Promise<void>} A promise that resolves when the check is complete.
 * @throws {Error} If an error occurs during the check.
 */
async function checkObsoleteMedia(dataSources) {
  try {
    debug('Checking for obsolete media...');

    // read all files in the media directory
    const files = fs.readdirSync(mediaDirectory);

    // Get all media names from the database table media
    const mediaNames = await dataSources.dataDB.media.getAllMediaNames();

    // Create thumb media names, remove the extension and add _thumb before the extension
    const thumbMediaNames = mediaNames.map((name) => {
      const extIndex = name.lastIndexOf('.');
      const baseName = name.substring(0, extIndex);
      const extension = name.substring(extIndex);
      return `${baseName}_thumb${extension}`;
    });
    // Combine media names and thumb media names
    const allMediaNames = [...mediaNames, ...thumbMediaNames];

    // Get all profile pictures from the database
    const profilePictures = await dataSources.dataDB.user.getImageUsers();
    // Extract file names from profilePictures URLs and add them to mediaNames
    const profilePictureNames = profilePictures.map((picture) => {
      const url = new URL(picture.image);
      return path.basename(url.pathname);
    });

    allMediaNames.push(...profilePictureNames);

    // verify if the file is in the database
    files.forEach(async (file) => {
      const filePath = path.join(mediaDirectory, file);
      const destinationPath = path.join(process.env.OBSOLETE_MEDIA_PATH, file);
      // if the file is not in the database, delete it
      if (!allMediaNames.includes(file)) {
        // copy the file to the obsolete media folder
        // don't copy the file ending with _thumb
        if (!file.endsWith('_thumb.webp')) {
          fs.copyFileSync(filePath, destinationPath);
        }
        // delete the file
        fs.unlinkSync(filePath);
      }
    });

    // send the obsolete media folder to the cloud

    debug('Obsolete media check complete.');
  } catch (error) {
    debug('Error while checking obsolete media:', error);
    logger.error({
      message: error.message,
      stack: error.stack,
      extensions: error.extensions,
    });
  }
}

/**
 * Checks and deletes obsolete users from the database.
 *
 * @async
 * @function checkObsoleteUsers
 * @param {Object} dataSources - The data sources object containing database access methods.
 * @param {Object} dataSources.dataDB - The database access object.
 * @param {Object} dataSources.dataDB.user - The user database access object.
 * @param {Function} dataSources.dataDB.user.deleteObsoleteUsers -
 * Function to delete obsolete users from the database.
 * @returns {Promise<void>} A promise that resolves when the check is complete.
 * @throws {Error} If an error occurs during the check.
 */
async function checkObsoleteUsers(dataSources) {
  debug('Checking for obsolete users...');
  try {
    await dataSources.dataDB.user.deleteObsoleteUsers();
    debug('Obsolete users check complete.');
  } catch (error) {
    debug('Error while checking obsolete users:', error);
    logger.error({
      message: error.message,
      stack: error.stack,
      extensions: error.extensions,
    });
  }

  checkObsoleteMedia(dataSources);
}

/**
 * Copies obsolete user data from the data source and saves it to a JSON file.
 * If no obsolete data is found, the function returns immediately.
 *
 * @param {Object} dataSources - The data sources object containing the dataDB.
 * @param {Object} dataSources.dataDB - The database object.
 * @param {Object} dataSources.dataDB.request - The request object for database operations.
 * @param {Function} dataSources.dataDB.request.copyObsoleteUser -
 * The function to copy obsolete user data.
 *
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
async function copyObsoleteUser(dataSources) {
  debug('Copying obsolete users...');
  const result = await dataSources.dataDB.request.copyObsoleteUser();

  if (result.rows[0].data !== null) {
    const filePath = `${process.env.SAVE_OBSOLETE_DATA_PATH}user_${new Date()
      .toISOString()
      .replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(
      filePath,
      JSON.stringify(result.rows[0].data, null, 2),
    );
    debug('File written to', filePath);
  }

  checkObsoleteUsers(dataSources);
}

/**
 * Checks and deletes obsolete requests from the database.
 *
 * @async
 * @function checkObsoleteRequests
 * @param {Object} dataSources - The data sources object containing database access methods.
 * @param {Object} dataSources.dataDB - The database access object.
 * @param {Object} dataSources.dataDB.request - The request database access object.
 * @param {Function} dataSources.dataDB.request.deleteObsoleteRequests -
 * Function to delete obsolete requests from the database.
 * @returns {Promise<void>} A promise that resolves when the check is complete.
 * @throws {Error} If an error occurs during the check.
 */
async function checkObsoleteRequests(dataSources) {
  debug('Checking for obsolete requests...');
  try {
    // get all conversation id from the requests deleted
    const conversationIds = await
    dataSources.dataDB.conversation.getConversationIdsByDeletedRequest();

    // remove all the request.id and conversation id from all subscription
    const subscriptions = await dataSources.dataDB.subscription.findAll();

    if (conversationIds.length > 0) {
    // check if the conversation id is in the subscription and remove it
      subscriptions.forEach(async (subscription) => {
        if (subscription.subscriber === 'clientConversation') {
          const subscriberIds = subscription.subscriber_id;

          const newConversationIds = subscriberIds.filter(
            (id) => !conversationIds.includes(id),
          );

          dataSources.dataDB.subscription.createSubscription(
            subscription.user_id,
            'clientConversation',
            newConversationIds,
          );
        }
      });

      await dataSources.dataDB.request.deleteObsoleteRequests();
    }
    debug('Obsolete requests check complete.');
  } catch (error) {
    debug('Error while checking obsolete users:', error);
    logger.error({
      message: error.message,
      stack: error.stack,
      extensions: error.extensions,
    });
  }

  copyObsoleteUser(dataSources);
}

/**
 * Checks for obsolete notification push endpoints and removes invalid ones.
 *
 * @param {Object} dataSources - The data sources object containing the database connections.
 * @param {Object} dataSources.dataDB - The database connection object.
 * @param {Object} dataSources.dataDB.notificationPush - The notification push database model.
 * @param {Function} dataSources.dataDB.notificationPush.findAll -
 * Function to find all notification push entries.
 * @param {Function} dataSources.dataDB.notificationPush.deleteNotification -
 * Function to delete a notification push entry.
 * @returns {Promise<void>} - A promise that resolves when the check is complete.
 */
async function checkEndpointsNotificaitonPush(dataSources) {
  debug('Checking for obsolete endpoints...');
  try {
    const allNotificationPush = await dataSources.dataDB.notificationPush.findAll();
    // send notification to all endpoint and remove the endpoint that are not valid
    allNotificationPush.forEach(async (notificationPush) => {
      const subscription = {
        endpoint: notificationPush.endpoint,
        keys: {
          p256dh: notificationPush.public_key,
          auth: notificationPush.auth_token,
        },
      };

      // Silently send a test notification to check if the endpoint is still valid
      const testPayload = JSON.stringify({
        silent: true,
      });

      try {
        const result = await sendPushNotification(subscription, testPayload);

        if (!result.success) {
          // If the notification fails, remove the endpoint from the database
          await dataSources.dataDB.notificationPush.deleteNotification(
            notificationPush.user_id,
            notificationPush.endpoint,
          );
        }
      } catch (error) {
        debug('Error while sending notification:', error);
      }
    });
    debug('Obsolete endpoints check complete.');
  } catch (error) {
    debug('Error while checking obsolete endpoints:', error);
    logger.error({
      message: error.message,
      stack: error.stack,
      extensions: error.extensions,
    });
  }
}

/**
 * Copies obsolete requests from the database, writes them to a JSON file,
 * and then deletes the obsolete requests from the database.
 *
 * @param {Object} dataSources - The data sources object containing the database connections.
 * @param {Object} dataSources.dataDB - The database connection object.
 * @param {Function} dataSources.dataDB.request.copyObsoleteRequests -
 * The function to copy obsolete requests from the database.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
async function copyObsoleteRequests(dataSources) {
  debug('Copying obsolete requests...');
  const result = await dataSources.dataDB.request.copyObsoleteRequests();

  if (result.rows[0].data !== null) {
    const filePath = `${process.env.SAVE_OBSOLETE_DATA_PATH}request_${new Date()
      .toISOString()
      .replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(
      filePath,
      JSON.stringify(result.rows[0].data, null, 2),
    );
    debug('File written to', filePath);
  }

  // delete obsolete requests
  checkObsoleteRequests(dataSources);
}

/**
 * Schedules tasks to clean and check obsolete data from the provided data sources.
 *
 * @param {Object} dataSources -
 * The data sources to be used for cleaning and checking obsolete data.
 *
 * The following tasks are scheduled:
 * - `copyObsoleteRequests`: Executes every day at 00:00.
 * - `checkEndpointsNotificaitonPush`: Executes every day at 01:00.
 *
 */
function sheduleCleanData(dataSources) {
  // minute, hour, day, month, day of the week
  // Execute every day at 00h00
  cron.schedule('0 0 * * *', () => {
    copyObsoleteRequests(dataSources);
  });

  // Execute every day at 01h00
  cron.schedule('0 1 * * *', () => {
    checkEndpointsNotificaitonPush(dataSources);
  });
}

export default sheduleCleanData;
