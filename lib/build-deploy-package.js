const fs = require('fs');

const tmp = require('tmp');
const targz = require('tar.gz');
const debug = require('debug')('deploygirl');

module.exports = function buildDeployPackage(dir, next) {
  tmp.tmpName((err, deploymentPackage) => {
    if (err) {return next(err);}

    // Stream magic
    const read = targz({}, { fromBase: true }).createReadStream(dir);

    read
      .pipe(fs.createWriteStream(deploymentPackage))
      .on('finish', () => {
        debug(`created a deployment package at path "${deploymentPackage}"`);

        next(null, deploymentPackage);
      })
      .on('error', (err) => {
        next(err);
      });
  });
};