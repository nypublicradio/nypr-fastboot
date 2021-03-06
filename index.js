const FastBootAppServer = require('fastboot-app-server');
const S3Downloader = require('fastboot-s3-downloader');
const S3Notifier = require('fastboot-s3-notifier');
const Sentry = require('@sentry/node');

const statsd = require('./lib/statsd-client-middleware')
const healthChecker = require('./lib/health-checker-middleware');
const preview = require('./lib/preview-middleware');
const logger = require('./lib/logger-middleware');

const FASTBOOT_DEFAULTS = {
  gzip: true,
  chunkedResponse: true,
};

module.exports = function({ bucket, manifestKey, healthCheckerUA, sentryDSN, loggerOptions, fastbootConfig = {}, env = 'dev', serviceName = 'fastboot' }) {

  fastbootConfig = {...FASTBOOT_DEFAULTS, ...fastbootConfig};

  if (sentryDSN) {
    Sentry.init({ dsn: sentryDSN });
  } else if (env !== 'dev') {
    // eslint-disable-next-line
    console.log("You must provide a Sentry DSN.");
    process.exit(1);
  }

  let beforeMiddleware = app => {
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.errorHandler());

    app.use(logger(loggerOptions));

    app.use(statsd({host: 'graphite.nypr.digital', namespace: `${env}.${serviceName}`}));

    if (healthCheckerUA) {
      // eslint-disable-next-line
      console.warn("Health Checker User Agent string provided. Please upgrade to using the path strategy.");
      app.use(healthChecker({ uaString: healthCheckerUA }));
    } else {
      app.use('/_health', healthChecker({strategy: 'path'}));
    }

    app.use(preview({ bucket }));

    if (fastbootConfig.distPath) {
      // if distPath is set, we're running locally
      const path = require('path');
      const express = require('express');
      let assetPath = path.join(fastbootConfig.distPath, 'assets');
      app.use('/assets', express.static(assetPath));
    }
    // default to marking everything else text/html
    app.use((_req, res, next) => {
      res.type('text/html');
      next();
    });
  }

  if (fastbootConfig.distPath) {
    // eslint-disable-next-line
    console.log('`distPath` specified. running in local mode.');
    return new FastBootAppServer({
      beforeMiddleware,
      ...fastbootConfig,
    });
  } else {
    let downloader = new S3Downloader({
      bucket,
      key: manifestKey,
    });

    let notifier = new S3Notifier({
      bucket,
      key: manifestKey,
    });

    return new FastBootAppServer({
      beforeMiddleware,
      downloader,
      notifier,
      ...fastbootConfig,
    });
  }

}
