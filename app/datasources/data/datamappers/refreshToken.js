import client from '../db/index.js';

// class RefreshToken to get the userData for getUserByToken whithout use cache
class RefreshToken {
  tableName = 'user';

  /**
   * getRefreshTokenByUserId - Retrieves refresh token for a given user ID.
   *
   * @param {number} userId  - The ID of the user to find refresh token for.
   * @returns {Promise<object>} A promise that resolves to an object of refresh token.
   * @throws {Error} If there is an issue with the database query.
   */
  async getRefreshTokenByUserId(userId) {
    const query = {
      text: `SELECT * FROM "${this.tableName}" WHERE id = $1`,
      values: [userId],
    };
    const { rows } = await client.query(query);
    const refreshToken = rows[0];

    return refreshToken;
  }
}

export default RefreshToken;
