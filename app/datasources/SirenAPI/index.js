import Debug from 'debug';
import { RESTDataSource } from '@apollo/datasource-rest';
import { GraphQLError } from 'graphql';

const debug = Debug(`${process.env.DEBUG_MODULE}:SirenAPI`);

debug('siren API starting');

// class to get siret data from api.siren
class SirenAPI extends RESTDataSource {
  constructor(options) {
    super(options);
    this.baseURL = process.env.SIREN_API_URL;
    this.token = process.env.SIREN_API_TOKEN;
  }

  willSendRequest(_path, request) {
    // eslint-disable-next-line dot-notation
    request.headers['Accept'] = 'application/json';
    // eslint-disable-next-line dot-notation
    request.headers['X-INSEE-Api-Key-Integration'] = this.token;
  }

  async getSiretData(siret) {
    try {
      const response = await this.get(siret);

      debug('response', response.etablissement);
      return response.etablissement;
    } catch (error) {
      debug('error', error);
      throw new GraphQLError('Error getting siret data', { extensions: { code: 'NOT_FOUND', httpStatus: 404 } });
    }
  }
}

export default SirenAPI;
