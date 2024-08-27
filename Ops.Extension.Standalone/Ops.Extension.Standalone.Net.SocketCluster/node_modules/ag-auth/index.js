const jwt = require('jsonwebtoken');

const scErrors = require('sc-errors');
const InvalidArgumentsError = scErrors.InvalidArgumentsError;

let AuthEngine = function () {};

AuthEngine.prototype.verifyToken = function (signedToken, key, options) {
  options = options || {};
  let jwtOptions = Object.assign({}, options);
  delete jwtOptions.socket;

  if (typeof signedToken === 'string' || signedToken == null) {
    return new Promise((resolve, reject) => {
      jwt.verify(signedToken || '', key, jwtOptions, (err, token) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(token);
      });
    });
  }
  return Promise.reject(
    new InvalidArgumentsError('Invalid token format - Token must be a string')
  );
};

AuthEngine.prototype.signToken = function (token, key, options) {
  options = options || {};
  let jwtOptions = Object.assign({}, options);
  return new Promise((resolve, reject) => {
    jwt.sign(token, key, jwtOptions, (err, signedToken) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(signedToken);
    });
  });
};

module.exports = AuthEngine;
