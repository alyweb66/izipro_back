import requestMutation from './requestMutation.js';
import userMutation from './userMutation.js';
import userHasJobMutation from './userHasJobMutation.js';
import userSettingsMutation from './userSettingsMutation.js';
import userHiddenClientRequestMutation from './userHiddenClientRequestMutation.js';
import conversationMutation from './conversationMutation.js';
import messageMutation from './messageMutation.js';
import subscriptionMutation from './subscriptionMutation.js';
import userHasViewedRequestMutation from './userHasNotViewedRequestMutation.js';

export default {
  ...requestMutation,
  ...userMutation,
  ...userHasJobMutation,
  ...userSettingsMutation,
  ...userHiddenClientRequestMutation,
  ...conversationMutation,
  ...messageMutation,
  ...subscriptionMutation,
  ...userHasViewedRequestMutation,

};
