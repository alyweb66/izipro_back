import Debug from 'debug';
import { GraphQLScalarType } from 'graphql';
import { UserInputError } from 'apollo-server-core';
import validator from 'validator';

const debug = Debug(`${process.env.DEBUG_MODULE}:scalars:validations`);

function debugInDevelopment(message) {
  if (process.env.NODE_ENV === 'development') {
    debug(message);
  }
}
// Custom scalar type for email validation
const validateEmail = new GraphQLScalarType({
  name: 'Email',
  description: 'Email custom scalar type',
  serialize(value) {
    // Validation during serialization
    if (!validator.isEmail(value)) {
      debugInDevelopment('ERROR: Invalid email address');
      throw new UserInputError('Invalid email address');
    }
    return value;
  },
  parseValue(value) {
    // Validation during value analysis
    if (!validator.isEmail(value)) {
      debugInDevelopment('ERROR: Invalid email address');
      throw new UserInputError('Invalid email address');
    }
    return value;
  },
  parseLiteral(ast) {
    // Validation during AST analysis
    if (!validator.isEmail(ast.value)) {
      debugInDevelopment('ERROR: Invalid email address');
      throw new UserInputError('Invalid email address');
    }
    return ast.value;
  },
});
// Custom scalar type for password validation
const validatePassword = new GraphQLScalarType({
  // minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1,
  // minSymbols: 1, returnScore: false, pointsPerUnique: 1,
  // pointsPerRepeat: 0.5, pointsForContainingLower: 10,
  // pointsForContainingUpper: 10, pointsForContainingNumber: 10,
  //  pointsForContainingSymbol: 10 }
  name: 'Password',
  description: 'Password custom scalar type',
  serialize(value) {
    // Validation during serialization
    if (!validator.isStrongPassword(value)) {
      debugInDevelopment('ERROR: Invalid password');
      throw new UserInputError('Invalid password');
    }
    return value;
  },
  parseValue(value) {
    // Validation during value analysis
    if (!validator.isStrongPassword(value)) {
      debugInDevelopment('ERROR: Invalid password');
      throw new UserInputError('Invalid password');
    }
    return value;
  },
  parseLiteral(ast) {
    // Validation during AST analysis
    if (!validator.isStrongPassword(ast.value)) {
      debugInDevelopment('ERROR: Invalid password');
      throw new UserInputError('Invalid password');
    }
    return ast.value;
  },
});
// Custom scalar type for postal code validation
const validatePostalCode = new GraphQLScalarType({
  name: 'PostalCode',
  description: 'PostalCode custom scalar type',
  serialize(value) {
    // Validation during serialization
    if (!validator.isPostalCode(value, 'any')) {
      debugInDevelopment('ERROR: Invalid postal code');
      throw new UserInputError('Invalid postal code');
    }
    return value;
  },
  parseValue(value) {
    // Validation during value analysis
    if (!validator.isPostalCode(value, 'any')) {
      debugInDevelopment('ERROR: Invalid postal code');
      throw new UserInputError('Invalid postal code');
    }
    return value;
  },
  parseLiteral(ast) {
    // Validation during AST analysis
    if (!validator.isPostalCode(ast.value, 'any')) {
      debugInDevelopment('ERROR: Invalid postal code');
      throw new UserInputError('Invalid postal code');
    }
    return ast.value;
  },
});
// Custom scalar type for SIRET validation
const validateSiret = new GraphQLScalarType({
  name: 'Siret',
  description: 'Siret custom scalar type',
  serialize(value) {
    // Validation during serialization
    const siretString = value.toString();
    if (siretString.length !== 14) {
      debugInDevelopment('ERROR: Invalid SIRET');
      throw new UserInputError('Invalid SIRET');
    }
    return value;
  },
  parseValue(value) {
    // Validation during value analysis
    const siretString = value.toString();
    if (siretString.length !== 14) {
      debugInDevelopment('ERROR: Invalid SIRET');
      throw new UserInputError('Invalid SIRET');
    }
    return value;
  },
  parseLiteral(ast) {
    // Validation during AST analysis
    const siretString = ast.value.toString();
    if (siretString.length !== 14) {
      debugInDevelopment('ERROR: Invalid SIRET');
      throw new UserInputError('Invalid SIRET');
    }
    return ast.value;
  },
});

export {
  validateEmail, validatePassword, validatePostalCode, validateSiret,
};
