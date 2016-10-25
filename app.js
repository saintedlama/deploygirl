const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

const debug = require('debug')('deploygirl');

const api = require('./api');
const config = require('./config');

const auth = require('./middleware/auth');

const app = express();

app.use(helmet());

app.use(cors(config.cors));
if (config.cors.origin) {
  app.options('*', cors());
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(auth(config.apiKey));

app.use(api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (process.env.NODE_ENV === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    debug('An Error occurred', err);

    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  debug('An Error occurred', err);

  res.json({
    message: err.message,
    error: {}
  });
});


module.exports = app;
