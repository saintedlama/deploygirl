const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const exec = require('child_process').exec;

const targz = require('tar.gz');
const debug = require('debug')('deploygirl');

const config = require('../config');
const discoverDeployScript = require('./discover-deploy-script');

module.exports = function(application, filePath, next) {
  getFilename((err, name) => {
    if (err) { return next(err); }

    const deployDir = path.join(config.deployDir, application, name);

    fs.createReadStream(filePath)
      .pipe(targz().createWriteStream(deployDir))
      .on('finish', () => {
        debug(`Received deployment for application ${application}...`);

        discoverDeployScript(deployDir, (err, deployScript) => {
          if (err) { return next(new Error('Could not find a deploy script in .deploy directory')); }

          const execOpts = Object.assign({}, { cwd: deployDir });

          // TODO: <build-dir> <cache-dir> <env-dir>
          exec(`${deployScript}`, execOpts, (err, stdout, stderr) => {
            if (err) {
              console.log('stdout', stdout);
              console.log('stderr', stderr);
              console.log('err', err);

              // TODO: Pass err to error
              return next(new Error(`Could not deploy application due to error ${err}!`));
            }

            next(null, { stdout, stderr });
          });
        });
      });
  });
};

function getFilename(cb) {
  crypto.pseudoRandomBytes(16, function(err, raw) {
    cb(err, err ? undefined : raw.toString('hex'));
  });
}