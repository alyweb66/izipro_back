import client from './db/index.js';

import MessageDataMapper from './datamappers/Message.js';
import UserDataMapper from './datamappers/User.js';
import RequestDataMapper from './datamappers/Request.js';
import MediaDataMapper from './datamappers/Media.js';
import ConversationDataMapper from './datamappers/Conversation.js';
import CategoryDataMapper from './datamappers/Category.js';
import JobDataMapper from './datamappers/Job.js';
import RequestHasMedia from './datamappers/requestHasMedia.js';
import UserHasJob from './datamappers/userHasJob.js';

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
  }
}

export default DataDB;
