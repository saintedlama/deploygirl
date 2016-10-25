const express = require('express');
const httpErrors = require('http-errors');
const uuid = require('uuid');

const upload = require('../middleware/upload');

const db = require('../lib/db');
const deploy = require('../lib/deploy');

const router = express.Router();

router.param('application', (req, res, next, id) =>{
  req.application = db
    .get('applications')
    .find({ id })
    .value();

  if (!req.application) {
    return next(new httpErrors.NotFound(`Could not find application ${id}`))
  }

  next();
});

router.get('/applications', function(req, res) {
  const applications = db
    .get('applications')
    .map(app => ({ id: app.id }))
    .value();

  res.json(applications);
});

router.get('/applications/:application', function(req, res) {
  res.json(req.application);
});

router.put('/applications/:applicationToCreate', function(req, res, next) {
  const id = req.params.applicationToCreate;

  if (db.get('applications').some({ id }).value()) {
    return next(new httpErrors.Conflict(`Application ${id} already exists`));
  }

  res.json(createApplication(id, req.body));
});

router.get('/applications/:application/deployments', function(req, res) {
  res.json(req.application.deployments);
});

router.post('/applications/:applicationToCreate/deployments', upload.any(), function(req, res, next) {
  const id = req.params.applicationToCreate;

  if (!req.files || req.files.length == 0) {
    return next(new httpErrors.BadRequest('No deployment package found in request'));
  }

  if (req.files.length > 1) {
    return next(new httpErrors.BadRequest('Received more than one deployment package in request'));
  }

  let application = db
    .get('applications')
    .find({ id })
    .value();

  if (!application) {
    application = createApplication(id);
  }

  if (application.deployments.some(d => d.state == 'deploying')) {
    return next(new httpErrors.Conflict('Application deployment is already running'));
  }

  const deployment = { id: uuid.v4(), state: 'deploying', createdAt: new Date(), updatedAt: new Date() };
  application.deployments.push(deployment);

  deploy(id, req.files[0].path, (err, log) => {
    const deploymentState = err?'error':'success';
    deployment.state = deploymentState;
    deployment.updatedAt = new Date();

    if (log) {
      deployment.stdout = log.stdout;
      deployment.stderr = log.stderr;
    }

    db.get('application')
      .find({ id })
      .assign(application)
      .value();

    if (err) {
      return next(new httpErrors.BadRequest(err));
    }

    res.json(deployment);
  });
});


function createApplication(id, fields) {
  fields = fields || {};

  const application = Object.assign({}, fields, { id, deployments: [] });

  db.get('applications')
    .push(application)
    .value();

  return application;
}

module.exports = router;