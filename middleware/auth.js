const auth = require('basic-auth');
const httpErrors = require('http-errors');
const debug = require('debug')('deploygirl');

module.exports = function(apiKey) {
  return function(req, res, next) {
    let key = req.query.key?req.query.key:fromBasicAuth(req);

    if (!key) {
      const message = 'Request is not authorized. No API key was passed in basic auth credentials or key query parameter';
      return next(new httpErrors.Unauthorized(message));
    }

    if (key != apiKey) {
      return next(new httpErrors.Unauthorized(`Request is not authorized. Passed API key ${key} does not match.`));
    }

    return next();
  }
};

function fromBasicAuth(req) {
  const credentials = auth(req);

  if (credentials) {
    return credentials.pass;
  }
}
