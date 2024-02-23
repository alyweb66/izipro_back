import Query from './query.js';
import Message from './message.js';
import User from './user.js';
import Request from './request.js';
import Media from './media.js';
import Mutation from './mutation.js';
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
  Message,
  User,
  Request,
  Media,
};
