const rc = require('rc');
const os = require('os');
const path = require('path');

module.exports = rc('deploygirl', {
  port: '3030',
  hostname: undefined, // Listen on all ports

  // API Key sent via basic auth
  apiKey: 'c3po',

  // Temporary deployment package upload directory
  uploadDir: os.tmpdir(),

  // Deployment working directory.
  // For every application a sub directory is created.
  deployDir: path.join(__dirname, '..', '.deployments'),

  // CORS options. See https://github.com/expressjs/cors for more options
  cors: {
    origin: false // Disable cors by default
  },

  ssl: {
    // Uncomment these lines if you want to your own self signed certificate
    // deploygirl always starts a SSL server but creates a self signed certificate
    // on the fly if keyFile and certFile are not set

    // keyFile:
    // certFile:
  }
});