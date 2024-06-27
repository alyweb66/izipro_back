import client from '../db/index.js';

// class RefreshToken to get the userData for getUserByToken whithout use cache
class RefreshToken {
  tableName = 'user';

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
