import Debug from 'debug';
import webpush from 'web-push';

const debug = Debug(`${process.env.DEBUG_MODULE}:webPush`);

// Verify if the VAPID keys and email contact are set in the environment variables
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.EMAIL_CONTACT) {
  debug('VAPID keys and email contact must be set in the environment variables');
  process.exit(1);
}

// Ensure EMAIL_CONTACT is in the correct format
const emailContact = process.env.EMAIL_CONTACT.startsWith('mailto:')
  ? process.env.EMAIL_CONTACT
  : `mailto:${process.env.EMAIL_CONTACT}`;

// VAPID keys should be generated only once.
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

// Configurer les détails VAPID
webpush.setVapidDetails(
  emailContact,
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

/**
 * Function to send a push notification
 *
 * @param {{endpoint: string, keys: {p256dh: string, auth: string}}}
 * subscription - Subscription object
 * @param {{title: string, body: string, icon: string, tag: number, renotify: boolean}}
 * payload - Payload object
 * @returns {nothing} - Nothing
 * @Error {error} - Error
 */
export default async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, payload);
    debug('Notification sent successfully');
  } catch (error) {
    debug('Error sending notification:', error);
  }
}

// Export public key for the frontend
export const vapidPublicKey = vapidKeys.publicKey;
