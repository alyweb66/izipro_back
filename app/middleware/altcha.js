import { createChallenge, verifySolution } from 'altcha-lib';

const hmacKey = process.env.ALTCHA_HMAC_KEY;
// Create a new challenge and send it to the client:
// Create a challenge for the client to solve
async function generateAltchaChallenge() {
  return createChallenge({
    hmacKey,
    maxNumber: 100000, // Difficulty of the challenge
  });
}
// Verify the ALTCHA solution sent by the client
async function verifyAltchaSolution(payload) {
  return verifySolution(payload, hmacKey);
}

export { generateAltchaChallenge, verifyAltchaSolution };
