import client from './db/index.js';

import MessageDataMapper from './datamappers/Message.js';
import UserDataMapper from './datamappers/User.js';
import RequestDataMapper from './datamappers/Request.js';
import MediaDataMapper from './datamappers/Media.js';
import ConversationDataMapper from './datamappers/Conversation.js';
import CategoryDataMapper from './datamappers/Category.js';
import JobDataMapper from './datamappers/Job.js';
import RequestHasMedia from './datamappers/RequestHasMedia.js';
import UserHasJob from './datamappers/UserHasJob.js';
import UserSetting from './datamappers/UserSetting.js';
import UserHasHiddingClientRequest from './datamappers/UserHasHiddingClientRequest.js';
import MessageHasMedia from './datamappers/MessageHasMedia.js';
import Subscription from './datamappers/Subscription.js';
import UserHasNotViewedRequest from './datamappers/UserHasNotViewedRequest.js';
import UserHasNotViewedConversation from './datamappers/UserHasNotViewedConversation.js';
import Rules from './datamappers/Rules.js';
import CookieConsents from './datamappers/CookieConsents.js';
import NotificationPush from './datamappers/NotificationPush.js';
import Notification from './datamappers/Notification.js';

// allows you to instantiate the datamappers
// to put it in context
class DataDB {
  constructor(options) {
    const newOptions = { ...options };
    newOptions.client = client;
    this.message = new MessageDataMapper(newOptions);
    this.user = new UserDataMapper(newOptions);
    this.request = new RequestDataMapper(newOptions);
    this.media = new MediaDataMapper(newOptions);
    this.conversation = new ConversationDataMapper(newOptions);
    this.category = new CategoryDataMapper(newOptions);
    this.job = new JobDataMapper(newOptions);
    this.requestHasMedia = new RequestHasMedia(newOptions);
    this.userHasJob = new UserHasJob(newOptions);
    this.userSetting = new UserSetting(newOptions);
    this.userHasHiddingClientRequest = new UserHasHiddingClientRequest(newOptions);
    this.messageHasMedia = new MessageHasMedia(newOptions);
    this.subscription = new Subscription(newOptions);
    this.userHasNotViewedRequest = new UserHasNotViewedRequest(newOptions);
    this.userHasNotViewedConversation = new UserHasNotViewedConversation(newOptions);
    this.rules = new Rules(newOptions);
    this.cookieConsents = new CookieConsents(newOptions);
    this.notificationPush = new NotificationPush(newOptions);
    this.notification = new Notification(newOptions);
  }
}

export default DataDB;
