import Debug from 'debug';
import { RESTDataSource } from '@apollo/datasource-rest';
import { ApolloError } from 'apollo-server-core';

const debug = Debug(`${process.env.DEBUG_MODULE}:SirenAPI`);

// class to get siret data from api.siren
debug('siren api starting');

class SirenAPI extends RESTDataSource {
  constructor(options) {
    super(options);
    this.baseURL = 'https://api.insee.fr/entreprises/sirene/V3/siret/';
    this.token = process.env.SIREN_API_TOKEN;
  }

  willSendRequest(_path, request) {
    // eslint-disable-next-line dot-notation
    request.headers['Accept'] = 'application/json';
    // eslint-disable-next-line dot-notation
    request.headers['Authorization'] = `Bearer ${this.token}`;
  }

  async getSiretData(siret) {
    try {
      const response = await this.get(siret);
      debug('response', response.etablissement.siret);
      return response.etablissement.siret;
    } catch (error) {
      debug('error', error);
      throw new ApolloError('Error getting siret data', 'SIREN_API_ERROR');
    }
  }
}

export default SirenAPI;
