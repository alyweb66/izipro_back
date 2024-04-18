import requestMutation from './requestMutation.js';
import userMutation from './userMutation.js';
import userHasJobMutation from './userHasJobMutation.js';
import userSettingsMutation from './userSettingsMutation.js';
import userHiddenClientRequestMutation from './userHiddenClientRequestMutation.js';
import conversationMutation from './conversationMutation.js';
import messageMutation from './messageMutation.js';

export default {
  ...requestMutation,
  ...userMutation,
  ...userHasJobMutation,
  ...userSettingsMutation,
  ...userHiddenClientRequestMutation,
  ...conversationMutation,
  ...messageMutation,

};
