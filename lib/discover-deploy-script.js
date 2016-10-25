const fs = require('fs');
const path = require('path');
const os = require('os');

const glob = require('glob');

module.exports = function discoverDeploymentScript(deployDir, next) {
  // TODO: Currently only 2 is working!
  // 1. Search for a .deploy.(platform dependent script) file
  // 2. Search for a .deploy directory and pick the deploy.(platform dependent script)
  const deploymentScriptsDir = path.join(deployDir, '.deploy');

  fs.lstat(deploymentScriptsDir, (err, stats) => {
    if (err) { return next(err); }

    if (!stats.isDirectory()) {
      return next(new Error('Expected directory ".deploy" to exist in deployment package root'));
    }

    glob('deploy.*', { cwd: deploymentScriptsDir, nodir: true}, (err, files) => {
      if (err) { return next(err); }

      // TODO: Check if exactly one script is returned and use a deployscript in a platform dependent way - .bat for win32, else .sh
      if (files.length == 0) {
        return next(new Error('No deploy script found in .deploy directory'));
      }

      const deployScript = files.shift();
      next(null, path.join(deployDir, '.deploy', deployScript));
    });
  });
};
