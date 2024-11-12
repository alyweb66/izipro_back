import Debug from 'debug';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import logger from './logger.js';

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
    files.forEach((file) => {
      const filePath = path.join(mediaDirectory, file);
      // if the file is not in the database, delete it
      if (!allMediaNames.includes(file)) {
        // delete the file
        fs.unlinkSync(filePath);
      }
    });
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

    // check if the conversation id is in the subscription and remove it
    subscriptions.forEach(async (subscription) => {
      if (subscription.subscriber === 'clientConversation') {
        const subscriberIds = subscription.subscriber_id;

        const newConversationIds = subscriberIds.filter((id) => !conversationIds.includes(id));

        dataSources.dataDB.subscription.createSubscription(subscription.user_id, 'clientConversation', newConversationIds);
      }
    });

    await dataSources.dataDB.request.deleteObsoleteRequests();

    debug('Obsolete requests check complete.');
  } catch (error) {
    debug('Error while checking obsolete users:', error);
    logger.error({
      message: error.message,
      stack: error.stack,
      extensions: error.extensions,
    });
  }
}

function sheduleCleanData(dataSources) {
  // Execute every day at 00h00
  cron.schedule('0 0 * * *', () => {
    checkObsoleteRequests(dataSources);
    checkObsoleteUsers(dataSources);
    checkObsoleteMedia(dataSources);
  });
}

export default sheduleCleanData;
