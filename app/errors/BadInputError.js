/** Class representing a bad input. */
class BadInputError extends Error {
  /**
       * create a bad input error
       *
       * @augments Error
       *
       * @param {Error} originalError - the original error
       */
  constructor(originalError) {
    super('Bad input error');
    if (originalError instanceof Error && originalError.details && originalError.details[0]) {
      this.originalError = originalError;
      this.detail = this.originalError.details[0].message;
    }
    this.httpStatusCode = 400;
  }
}

export default BadInputError;
