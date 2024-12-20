import Debug from 'debug';
import CoreDatamapper from './CoreDatamapper.js';

const debug = Debug(`${process.env.DEBUG_MODULE}:datamappers:request`);

class Request extends CoreDatamapper {
  tableName = 'request';

  viewName = 'getRequestConversation';

  viewNameByConversation = 'getRequestByConversation';

  QueryFunc = 'getRequestByJob';

  QueryFuncByConversation = 'getMyConversationRequest';

  QuerySubFunc = 'getRequestSubscription';

  /**
   * get all requests by user id
   *
   * @param {number} userId - The ID of the user to find requests for.
   * @param {number} offset - The offset of the request.
   * @param {number} limit - The limit of the request.
   * @returns {Promise<Array>} A promise that resolves to an array of request objects.
   * @throws {Error} If there is an issue with the database query.
   */
  async getRequestByUserId(userId, offset, limit = null) {
    debug('Finding request by user id');
    debug(`SQL function ${this.viewNameByConversation} called`);

    const query = {
      text: `SELECT * FROM "${this.viewNameByConversation}" WHERE user_id = $1 AND deleted_at IS NULL OFFSET $2 LIMIT $3`,
      values: [userId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const request = rows;

    return request;
  }

  /**
   *  get the request by request id
   *
   * @param {number} requestId - The ID of the request to find.
   * @returns {Promise<object>} A promise that resolves to an object of request.
   * @throws {Error} If there is an issue with the database query
   */
  async getRequestByRequestId(requestId) {
    debug(`Finding request by request id: ${requestId}`);
    debug(`SQL function ${this.viewNameByConversation} called`);
    // call sql function
    const query = {
      text: `SELECT * FROM "${this.viewNameByConversation}" WHERE id = $1`,
      values: [requestId],
    };
    const { rows } = await this.client.query(query);
    const request = rows[0];

    return request;
  }

  /**
   * get all conversation id of request by user id
   *
   * @param {number} userId - The ID of the user to find requests for.
   * @returns {Promise<Array>} A promise that resolves to an array of request objects.
   * @throws {Error} If there is an issue with the database query.
   */
  async getRequestsConvId(userId) {
    debug('Finding all conversation id of request by user id');
    debug(`SQL function ${this.tableName} called`);

    const query = {
      text: `SELECT conversation.id FROM "${this.tableName}" 
      JOIN conversation ON conversation.request_id = request.id
      WHERE request.user_id = $1`,
      values: [userId],
    };
    const { rows } = await this.client.query(query);
    const idArray = rows.map((row) => row.id);
    const request = idArray;

    return request;
  }

  /**
   * get all requests by job id
   *
   * @param {number} jobId - The ID of the job to find requests for.
   * @param {number} userId - The ID of the user to find requests for.
   * @param {number} offset - The offset of the request.
   * @param {number} limit - The limit of the request.
   * @returns {Promise<Array>} A promise that resolves to an array of request objects.
   * @throws {Error} If there is an issue with the database query.
   */
  async getRequestByJobId(jobId, userId, offset, limit) {
    debug('Finding request by job id');
    debug(`SQL function ${this.QueryFunc} called`);

    try {
      const query = {
        text: `SELECT * FROM ${this.QueryFunc} ($1, $2, $3, $4)`,
        values: [jobId, userId, offset, limit],
      };
      const { rows } = await this.client.query(query);
      const requestsByJob = rows;

      return requestsByJob;
    } catch (error) {
      debug(error);
    }

    return null;
  }

  /**
   * get all requests by subscription and job id
   *
   * @param {number} jobId - The ID of the job to find requests for.
   * @param {number} userId - The ID of the user to find requests for.
   * @param {number} requestId - The ID of the request to find.
   * @param {number} offset - the offset of the request
   * @param {number} limit - the limit of the request
   * @returns {Promise<Array>} A promise that resolves to an object of request.
   * @throws {Error} If there is an issue with the database query.
   */
  async getSubscritpionRequest(
    jobId,
    userId,
    requestId,
    offset = 0,
    limit = 1,
  ) {
    debug('Finding subscription request by job id');
    debug(`SQL function ${this.QuerySubFunc} called`);

    const query = {
      text: `SELECT * FROM ${this.QuerySubFunc} ($1, $2, $4, $5)
      WHERE id = $3`,
      values: [jobId, userId, requestId, offset, limit],
    };
    const { rows } = await this.client.query(query);
    const job = rows;

    return job;
  }

  /**
   * get all requests by conversation
   *
   * @param {number} userId - The ID of the user to find requests for.
   * @param {number} offset - The offset of the request.
   * @param {number} limit - The limit of the request.
   * @returns {Promise<Array>} A promise that resolves to an array of request objects.
   * @throws {Error} If there is an issue with the database query
   */
  async getRequestByConversation(userId, offset = 0, limit = 3) {
    debug('Finding request by user conversation');
    debug(`SQL function ${this.QueryFuncByConversation} called`);

    try {
      const query = {
        text: `SELECT * FROM ${this.QueryFuncByConversation}($1, $2, $3)`,
        values: [userId, offset, limit],
      };

      const { rows } = await this.client.query(query);

      return rows;
    } catch (error) {
      debug('error', error);
    }
    return null;
  }

  /**
   * Deletes requests with deleted_at older than 1 month.
   *
   * @returns {Promise<void>}
   */
  async deleteObsoleteRequests() {
    debug('Deleting obsolete requests');
    const query = {
      text: `DELETE FROM "${this.tableName}" WHERE "deleted_at" < NOW() - INTERVAL '1 month' 
      RETURNING*`,
    };
    const result = await this.client.query(query);

    return result.rowCount;
  }

  /**
   * Copy requests with deleted_at older than 1 month.
   *
   * @returns {Promise<void>}
   */
  async copyObsoleteRequests() {
    debug('Copy obsolete requests');
    const query = {
      text: `
          SELECT json_agg(t) AS data
FROM (
    SELECT
        r.id AS request_id,
        r.title,
        r.message AS request_message,
        r.city,
        r.urgent,
        r.user_id AS request_user_id,
        r.job_id,
        r.range,
        r.created_at AS request_created_at,
        r.deleted_at AS request_deleted_at,

        -- Conversations
        (
            SELECT json_agg(
                json_build_object(
                    'conversation_id', c.id,
                    'user_1', c.user_1,
                    'user_2', c.user_2,
                    'created_at', c.created_at,
                    'updated_at', c.updated_at,
                    'messages', (
                        SELECT json_agg(
                            json_build_object(
                                'message_id', m.id,
                                'content', m.content,
                                'created_at', m.created_at,
                                'user_id', m.user_id,
                                'media', (
                                    SELECT json_agg(
                                        json_build_object(
                                            'media_id', mm.id,
                                            'url', mm.url
                                        )
                                    )
                                    FROM message_has_media mhm
                                    LEFT JOIN media mm ON mm.id = mhm.media_id
                                    WHERE mhm.message_id = m.id
                                )
                            )
                        )
                        FROM message m
                        WHERE m.conversation_id = c.id
                    )
                )
            )
            FROM conversation c
            WHERE c.request_id = r.id
        ) AS conversations,

        -- Request media
        (
            SELECT json_agg(
                json_build_object(
                    'media_id', rm.id,
                    'url', rm.url
                )
            )
            FROM request_has_media rhm
            LEFT JOIN media rm ON rm.id = rhm.media_id
            WHERE rhm.request_id = r.id
        ) AS request_media
    FROM request r
    WHERE r.deleted_at < NOW() - INTERVAL '1 month'
) t;

      `,
    };

    const result = await this.client.query(query);
    return result;
  }

  /**
   * Copy user with deleted_at older than 1 month.
   *
   * @returns {Promise<void>}
   */
  async copyObsoleteUser() {
    debug('Copy obsolete user');
    const query = {
      text: `
          SELECT json_agg(u) AS data
FROM (
    SELECT
        u.id AS user_id,
        u.role,
        u.created_at AS user_created_at,
        u.updated_at AS user_updated_at,

        -- User request
        (
            SELECT json_agg(
                json_build_object(
                    'request_id', r.id,
                    'title', r.title,
                    'message', r.message,
                    'city', r.city,
                    'urgent', r.urgent,
                    'job_id', r.job_id,
                    'range', r.range,
                    'created_at', r.created_at,
                    'deleted_at', r.deleted_at,

                    -- Conversations 
                    'conversations', (
                        SELECT json_agg(
                            json_build_object(
                                'conversation_id', c.id,
                                'user_1', c.user_1,
                                'user_2', c.user_2,
                                'created_at', c.created_at,
                                'updated_at', c.updated_at,
                                'messages', (
                                    SELECT json_agg(
                                        json_build_object(
                                            'message_id', m.id,
                                            'content', m.content,
                                            'created_at', m.created_at,
                                            'user_id', m.user_id,
                                            'media', (
                                                    SELECT json_agg(
                                                        json_build_object(
                                                            'media_id', mm.id,
                                                            'url', mm.url
                                                        )
                                                    )
                                                    FROM message_has_media mhm
                                                    LEFT JOIN media mm ON mm.id = mhm.media_id
                                                    WHERE mhm.message_id = m.id
                                                )
                                        )
                                    )
                                    FROM message m
                                    WHERE m.conversation_id = c.id
                                )
                            )
                        )
                        FROM conversation c
                        WHERE c.request_id = r.id
                    ),

                    -- Request media
                    'request_media', (
                        SELECT json_agg(
                            json_build_object(
                                'media_id', rm.id,
                                'url', rm.url
                            )
                        )
                        FROM request_has_media rhm
                        LEFT JOIN media rm ON rm.id = rhm.media_id
                        WHERE rhm.request_id = r.id
                    )
                )
            )
            FROM request r
            WHERE r.user_id = u.id
        ) AS requests
              FROM "user" u
              WHERE u.deleted_at < NOW() - INTERVAL '1 month'
          ) u;
      `,
    };

    const result = await this.client.query(query);
    return result;
  }
}
export default Request;
