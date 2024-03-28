import Query from './query.js';
import Message from './message.js';
import User from './user.js';
import Request from './request.js';
import Media from './media.js';
import Conversation from './conversation.js';
import Category from './category.js';
import Job from './job.js';
import Mutation from './mutation.js';
// import UserMutation from './userMutation.js';
// import RequestMutation from './requestMutation.js';
import Subscription from './subscription.js';
import {
  validateEmail, validatePassword, validatePostalCode, validateSiret,
} from '../validations/validationScalars.js';

export default {
  validateEmail,
  validatePassword,
  validatePostalCode,
  validateSiret,
  Query,
  Mutation,
  Subscription,
  Message,
  User,
  Request,
  Media,
  Conversation,
  Category,
  Job,
};
