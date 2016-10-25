#!/usr/bin/env node
const fs = require('fs');

const argv = require('yargs').argv;
const request = require('request');

const buildDeployPackage = require('../lib/build-deploy-package');

buildDeployPackage('.', (err, deploymentPackage) => {
  if (err) {
    console.log('Uh no err...', err);
    process.exit(1);
  }

  // TODO: Make application required
  // TODO: configure: url, application, apiKey
  // TODO: Commands?
  request({
    method: 'POST',
    uri: 'http://deploygirl:c3po@localhost:3000/applications/one/deployments',
    formData: {
      deploymentPackage: fs.createReadStream(deploymentPackage)
    }
  }).on('response', function(response) {
    // TODO: Output
    if (response.statusCode >= 200 && response.statusCode < 400) {
      console.log('Deployed...');
    } else {
      console.error('Not deployed due to error');
      process.exit(3);
    }
  }).on('error', (err) => {
    console.error('Could not connect to deploygirl server due to error', err);
    process.exit(2);
  });
});